import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as cardReplacementIndex } from '@/routes/card-replacement';
import { extend as membersExtend, index as membersIndex, show as membersShow } from '@/routes/members';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, CreditCard, IdCard, Loader2, MapPin, Phone, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import InputError from '@/components/input-error';

type MemberStatus = 'active' | 'inactive' | 'expired';

const statusCopy: Record<MemberStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
    inactive: { label: 'Inactive', className: 'bg-warning/10 text-warning border-warning/20' },
    expired: { label: 'Expired', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const tabs = [
    { key: 'profile', label: 'Profil' },
    { key: 'vehicles', label: 'Kendaraan' },
    { key: 'membership', label: 'Membership' },
    { key: 'visits', label: 'Riwayat Kunjungan' },
];

const getDaysLeft = (expiresAt?: string | null) => {
    if (!expiresAt) {
        return 0;
    }
    const today = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function MemberDetail() {
    const { member, vehicles, memberships, recentVisits, flash } = usePage<{
        member: {
            id: string;
            member_code: string;
            name: string;
            phone: string;
            address: string;
            package: string;
            status: MemberStatus;
            card_uid: string;
            joined_at?: string | null;
            expires_at?: string | null;
            package_quota?: number;
        };
        vehicles: { id: number; plate: string; color: string | null }[];
        memberships: { id: number; valid_from: string; valid_to: string; status: string }[];
        recentVisits: { id: number; visit_date: string; visit_time: string; status: string }[];
        flash?: {
            success?: string;
        };
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Members', href: membersIndex().url },
        { title: member.name, href: membersShow(member.id).url },
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const [isExtending, setIsExtending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showExtendDialog, setShowExtendDialog] = useState(false);
    const [validTo, setValidTo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
    
    const daysLeft = getDaysLeft(member.expires_at ?? undefined);
    const packageQuota = member.package_quota ?? vehicles.length;
    const packageInfo = { name: member.package, quota: packageQuota };
    const canAddVehicle = vehicles.length < packageQuota;
    const joinedAtFormatted = useMemo(() => formatDateTime(member.joined_at), [member.joined_at]);

    const { data: vehicleData, setData: setVehicleData, post: postVehicle, processing: isAddingVehicle, errors: vehicleErrors, reset: resetVehicleForm } = useForm({
        plate: '',
        color: '',
    });

    const parsePlate = (plate: string) => {
        const cleaned = plate.replace(/\s/g, '').toUpperCase();
        const match = cleaned.match(/^([A-Z]{0,2})(\d{0,4})([A-Z]{0,2})$/);
        if (match) {
            return {
                prefix: match[1] || '',
                number: match[2] || '',
                suffix: match[3] || '',
            };
        }
        const parts = cleaned.match(/^([A-Z]*)(\d*)([A-Z]*)$/);
        return {
            prefix: parts?.[1]?.slice(0, 2) || '',
            number: parts?.[2]?.slice(0, 4) || '',
            suffix: parts?.[3]?.slice(0, 2) || '',
        };
    };

    const combinePlate = (prefix: string, number: string, suffix: string) => {
        return `${prefix} ${number} ${suffix}`.trim().replace(/\s+/g, ' ').toUpperCase();
    };

    const plateParts = parsePlate(vehicleData.plate);

    const updatePlatePart = (part: 'prefix' | 'number' | 'suffix', value: string) => {
        plateParts[part] = value;
        const combined = combinePlate(plateParts.prefix, plateParts.number, plateParts.suffix);
        setVehicleData('plate', combined);
    };

    const handleOpenAddVehicleDialog = () => {
        resetVehicleForm();
        setShowAddVehicleDialog(true);
    };

    const handleCloseAddVehicleDialog = () => {
        setShowAddVehicleDialog(false);
        resetVehicleForm();
    };

    const handleAddVehicle = () => {
        postVehicle(`/members/${member.id}/vehicles`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddVehicleDialog(false);
                resetVehicleForm();
            },
        });
    };
    const expiresAtFormatted = useMemo(() => formatDateTime(member.expires_at), [member.expires_at]);

    // Set default date (1 month from now or from expiry date, whichever is later)
    const getDefaultDate = () => {
        const today = new Date();
        const expiryDate = member.expires_at ? new Date(member.expires_at) : today;
        const startDate = expiryDate > today ? expiryDate : today;
        const defaultDate = new Date(startDate);
        defaultDate.setMonth(defaultDate.getMonth() + 1);
        return defaultDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            setShowExtendDialog(false);
            setValidTo('');
            setError(null);
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const handleOpenExtendDialog = () => {
        setValidTo(getDefaultDate());
        setError(null);
        setShowExtendDialog(true);
    };

    const handleCloseExtendDialog = () => {
        setShowExtendDialog(false);
        setValidTo('');
        setError(null);
    };

    const handleExtendMembership = () => {
        if (!validTo) {
            setError('Tanggal akhir wajib diisi');
            return;
        }

        const selectedDate = new Date(validTo);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('Tanggal akhir harus setelah hari ini');
            return;
        }

        const expiryDate = member.expires_at ? new Date(member.expires_at) : today;
        expiryDate.setHours(0, 0, 0, 0);

        if (member.expires_at && selectedDate <= expiryDate) {
            setError('Tanggal akhir harus setelah tanggal berakhir membership saat ini');
            return;
        }

        setError(null);
        setIsExtending(true);
        router.post(
            membersExtend(member.id).url,
            {
                valid_to: validTo,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsExtending(false);
                },
                onError: (errors) => {
                    if (errors.valid_to) {
                        setError(Array.isArray(errors.valid_to) ? errors.valid_to[0] : errors.valid_to);
                    }
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Member ${member.name}`} />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {showSuccess && flash?.success && (
                    <div className="rounded-lg border border-success/60 bg-success/10 p-4 text-success">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 size-5" />
                            <p className="text-sm font-medium">{flash.success}</p>
                        </div>
                    </div>
                )}
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardContent className="flex flex-col gap-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                        {member.name}
                                    </h1>
                                    <Badge variant="outline">{member.member_code}</Badge>
                                    <Badge
                                        variant="outline"
                                        className={statusCopy[member.status as MemberStatus]?.className}
                                    >
                                        {statusCopy[member.status as MemberStatus]?.label}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-2">
                                        <CreditCard className="size-4" /> Paket {packageInfo.name}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Calendar className="size-4" /> Bergabung {joinedAtFormatted}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Clock className="size-4" /> Berakhir {expiresAtFormatted}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => router.visit(membersIndex().url)}
                                >
                                    ← Kembali ke Daftar
                                </Button>
                                <Button asChild variant="outline" className="gap-2">
                                    <Link href={cardReplacementIndex()} prefetch>
                                        <IdCard className="size-4" /> Request Penggantian Kartu
                                    </Link>
                                </Button>
                                <Button
                                    className="gap-2"
                                    onClick={handleOpenExtendDialog}
                                >
                                    <RefreshCw className="size-4" /> Perpanjang Membership
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 rounded-xl border border-sidebar-border/60 bg-muted/30 p-4 text-sm dark:border-sidebar-border lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="font-medium text-foreground">Masa berlaku</span>
                                <div className="w-48 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-primary"
                                        style={{ width: `${Math.max(10, Math.min(100, (daysLeft / 365) * 100))}%` }}
                                    />
                                </div>
                                <span className="text-muted-foreground">
                                    {daysLeft > 0
                                        ? `${daysLeft} hari tersisa`
                                        : 'Membership sudah kadaluarsa'}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Card UID:</span> {member.card_uid}
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-2">
                                {tabs.map((tab) => (
                                    <Button
                                        key={tab.key}
                                        variant={activeTab === tab.key ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {activeTab === 'profile' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Profil Member</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <Phone className="mt-1 size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                                    <p className="text-base font-medium">{member.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-1 size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Alamat</p>
                                    <p className="text-base font-medium leading-relaxed">{member.address}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'vehicles' && (
                    <div className="flex flex-col gap-4">
                        {canAddVehicle && (
                            <Button
                                variant="outline"
                                className="gap-2 w-fit"
                                onClick={handleOpenAddVehicleDialog}
                            >
                                <Plus className="size-4" /> Tambah Kendaraan
                            </Button>
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                            {vehicles.map((vehicle, index) => (
                                <Card
                                    key={vehicle.plate}
                                    className="border-sidebar-border/70 bg-card/60 shadow-sm transition hover:border-primary/60 dark:border-sidebar-border"
                                >
                                    <CardContent className="flex flex-col gap-3 p-6">
                                        <Badge variant="outline">Kendaraan #{index + 1}</Badge>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Plat Nomor</p>
                                            <p className="text-lg font-semibold">{vehicle.plate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Warna</p>
                                            <p className="text-base font-medium">{vehicle.color || '—'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {vehicles.length === 0 && (
                                <div className="col-span-2 text-center py-8 text-muted-foreground">
                                    Belum ada kendaraan terdaftar
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'membership' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardContent className="grid gap-6 p-6">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                    <strong>Aktif sejak:</strong> {joinedAtFormatted}
                                </span>
                                <span>
                                    <strong>Berlaku hingga:</strong> {expiresAtFormatted}
                                </span>
                                <span>
                                    <strong>Paket:</strong> {packageInfo.name}
                                </span>
                                <span>
                                    <strong>Kuota Kendaraan:</strong> {packageInfo.quota}
                                </span>
                            </div>
                            <div className="rounded-lg border border-dashed border-sidebar-border/60 p-4 text-sm text-muted-foreground dark:border-sidebar-border">
                                Catatan: Paket {packageInfo.name} memungkinkan {packageInfo.quota} kendaraan aktif sekaligus. Gunakan tombol perpanjang untuk memperbaharui masa berlaku.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'visits' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Jam</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentVisits.map((visit) => (
                                            <tr
                                                key={visit.id}
                                                className="border-t border-sidebar-border/60 text-foreground transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">{visit.visit_date}</td>
                                                <td className="px-4 py-3">{visit.visit_time}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            visit.status === 'allowed'
                                                                ? 'bg-success/10 text-success border-success/20'
                                                                : 'bg-destructive/10 text-destructive border-destructive/20'
                                                        }
                                                    >
                                                        {visit.status === 'allowed' ? 'Allowed' : 'Blocked'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={showExtendDialog} onOpenChange={(open) => {
                    if (!open) {
                        handleCloseExtendDialog();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Perpanjang Membership</DialogTitle>
                            <DialogDescription>
                                Pilih tanggal sampai kapan membership akan diperpanjang. Tanggal harus setelah{' '}
                                {member.expires_at ? expiresAtFormatted : 'hari ini'}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="valid-to">Berlaku Sampai</Label>
                                <Input
                                    id="valid-to"
                                    type="date"
                                    value={validTo}
                                    onChange={(e) => {
                                        setValidTo(e.target.value);
                                        setError(null);
                                    }}
                                    min={
                                        member.expires_at
                                            ? new Date(new Date(member.expires_at).getTime() + 24 * 60 * 60 * 1000)
                                                  .toISOString()
                                                  .split('T')[0]
                                            : new Date().toISOString().split('T')[0]
                                    }
                                    className={error ? 'border-destructive' : ''}
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseExtendDialog}
                                disabled={isExtending}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleExtendMembership}
                                disabled={isExtending || !validTo}
                            >
                                {isExtending ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" /> Memproses...
                                    </>
                                ) : (
                                    'Perpanjang'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showAddVehicleDialog} onOpenChange={(open) => {
                    if (!open) {
                        handleCloseAddVehicleDialog();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Kendaraan</DialogTitle>
                            <DialogDescription>
                                Tambahkan kendaraan baru untuk member ini. Paket {packageInfo.name} memungkinkan maksimal {packageInfo.quota} kendaraan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="plate-prefix">Plat Nomor</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="plate-prefix"
                                        placeholder="AB"
                                        value={plateParts.prefix}
                                        onChange={(e) => updatePlatePart('prefix', e.target.value.toUpperCase())}
                                        maxLength={2}
                                        className="w-20"
                                        onKeyDown={(e) => {
                                            if (e.key !== 'Backspace' && plateParts.prefix.length === 2) {
                                                (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                                            }
                                            if (e.key === 'Backspace' && plateParts.prefix === '') {
                                                (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                                            }
                                        }}
                                    />
                                    <Input
                                        id="plate-number"
                                        placeholder="1234"
                                        value={plateParts.number}
                                        onChange={(e) => updatePlatePart('number', e.target.value.replace(/\D+/g, ''))}
                                        maxLength={4}
                                        className="w-28"
                                        onKeyDown={(e) => {
                                            if (e.key !== 'Backspace' && plateParts.number.length === 4) {
                                                (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                                            }
                                            if (e.key === 'Backspace' && plateParts.number === '') {
                                                (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                                            }
                                        }}
                                    />
                                    <Input
                                        id="plate-suffix"
                                        placeholder="CD"
                                        value={plateParts.suffix}
                                        onChange={(e) => updatePlatePart('suffix', e.target.value.toUpperCase())}
                                        maxLength={2}
                                        className="w-20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && plateParts.suffix === '') {
                                                (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Format:</span>
                                    <Badge variant="outline">
                                        {combinePlate(
                                            plateParts.prefix || 'AB',
                                            plateParts.number || '1234',
                                            plateParts.suffix || 'CD'
                                        )}
                                    </Badge>
                                </div>
                                <InputError message={vehicleErrors.plate} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="vehicle-color">Warna (Opsional)</Label>
                                <Input
                                    id="vehicle-color"
                                    placeholder="Contoh: Hitam, Putih, Merah"
                                    value={vehicleData.color}
                                    onChange={(e) => setVehicleData('color', e.target.value)}
                                />
                                <InputError message={vehicleErrors.color} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseAddVehicleDialog}
                                disabled={isAddingVehicle}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleAddVehicle}
                                disabled={isAddingVehicle || !vehicleData.plate}
                            >
                                {isAddingVehicle ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" /> Menambahkan...
                                    </>
                                ) : (
                                    'Tambah'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
