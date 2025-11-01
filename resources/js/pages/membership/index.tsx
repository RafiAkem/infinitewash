import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as membershipIndex } from '@/routes/membership';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3, ClipboardPlus, Gauge, Loader2, Search, Calendar } from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { useState, useEffect } from 'react';
import { getCsrfToken } from '@/utils/csrf';

interface Package {
    id: string;
    name: string;
    price: number;
    quota: number;
    description: string;
}

interface Member {
    id: string;
    name: string;
    packageId: string;
    vehicles: Array<{ plate: string; color: string }>;
}

interface MembershipPageProps extends PageProps {
    packages: Package[];
    members: Member[];
    statistics: {
        totalMembers: number;
        totalVehicles: number;
        activePackages: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    csrfToken?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Membership',
        href: membershipIndex().url,
    },
];

interface FoundMember {
    id: string;
    member_code: string;
    name: string;
    phone: string;
    package: string;
    package_name: string;
    status: string;
    expires_at: string | null;
    days_left: number;
    vehicles: Array<{ plate: string; color: string }>;
}

export default function MembershipOverview({ packages, members, statistics }: MembershipPageProps) {
    const { totalMembers, totalVehicles, activePackages } = statistics;
    const { flash } = usePage<MembershipPageProps>().props;
    const [cardUid, setCardUid] = useState('');
    const [searching, setSearching] = useState(false);
    const [extending, setExtending] = useState(false);
    const [foundMember, setFoundMember] = useState<FoundMember | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonths, setSelectedMonths] = useState<number | null>(null);

    // Clear form when success message appears
    useEffect(() => {
        if (flash?.success) {
            setCardUid('');
            setFoundMember(null);
            setSelectedMonths(null);
            setError(null);
        }
    }, [flash?.success]);

    const handleSearch = async () => {
        if (!cardUid.trim() || cardUid.length !== 10) {
            setError('UID harus 10 digit');
            return;
        }

        setSearching(true);
        setError(null);
        setFoundMember(null);

        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/membership/search-by-uid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ card_uid: cardUid }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setFoundMember(data.member);
                setError(null);
            } else {
                setError(data.message || 'Member tidak ditemukan');
                setFoundMember(null);
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mencari member');
            setFoundMember(null);
        } finally {
            setSearching(false);
        }
    };

    const handleExtend = () => {
        if (!foundMember || !selectedMonths) {
            setError('Pilih durasi perpanjangan');
            return;
        }

        setExtending(true);
        setError(null);

        router.post(
            '/membership/extend',
            {
                card_uid: cardUid,
                months: selectedMonths,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCardUid('');
                    setFoundMember(null);
                    setSelectedMonths(null);
                },
                onError: (errors) => {
                    if (errors.card_uid) {
                        setError(Array.isArray(errors.card_uid) ? errors.card_uid[0] : errors.card_uid);
                    } else if (errors.months) {
                        setError(Array.isArray(errors.months) ? errors.months[0] : errors.months);
                    }
                },
                onFinish: () => {
                    setExtending(false);
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {/* Memperpanjang Membership Section */}
                <section className="rounded-xl border border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-2 border-b border-sidebar-border/60 px-6 py-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold">Memperpanjang Membership</h2>
                        <p className="text-sm text-muted-foreground">
                            Cari member berdasarkan nomor UID kartu untuk memperpanjang membership.
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="search-uid">Nomor UID</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="search-uid"
                                            placeholder="Masukkan 10 digit UID"
                                            value={cardUid}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D+/g, '').slice(0, 10);
                                                setCardUid(value);
                                                setFoundMember(null);
                                                setError(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && cardUid.length === 10) {
                                                    handleSearch();
                                                }
                                            }}
                                            inputMode="numeric"
                                            maxLength={10}
                                            className={error ? 'border-destructive' : ''}
                                        />
                                        {searching && (
                                            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                    <Button onClick={handleSearch} disabled={searching || cardUid.length !== 10}>
                                        <Search className="size-4 mr-2" />
                                        {searching ? 'Mencari...' : 'Cari'}
                                    </Button>
                                </div>
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                                {flash?.success && (
                                    <p className="text-sm text-success bg-success/10 border border-success/20 rounded-md p-2">
                                        {flash.success}
                                    </p>
                                )}
                            </div>

                            {foundMember && (
                                <div className="mt-4 rounded-lg border border-sidebar-border/60 bg-muted/30 p-4 dark:border-sidebar-border">
                                    <h3 className="font-semibold mb-3">Informasi Member</h3>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Nama:</span>
                                            <span className="font-medium">{foundMember.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Member Code:</span>
                                            <span className="font-medium">{foundMember.member_code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Paket:</span>
                                            <span className="font-medium">{foundMember.package_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={foundMember.status === 'active' ? 'default' : 'secondary'}>
                                                {foundMember.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Berlaku Sampai:</span>
                                            <span className="font-medium">
                                                {foundMember.expires_at || 'Tidak ada membership aktif'}
                                            </span>
                                        </div>
                                        {foundMember.days_left !== null && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Sisa Hari:</span>
                                                <span className="font-medium">{Math.floor(foundMember.days_left)} hari</span>
                                            </div>
                                        )}
                                        {foundMember.vehicles.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Kendaraan:</span>
                                                <span className="font-medium">
                                                    {foundMember.vehicles.map(v => v.plate).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-sidebar-border/60 dark:border-sidebar-border">
                                        <Label className="mb-2 block">Pilih Durasi Perpanjangan</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {[1, 3, 6, 12].map((months) => (
                                                <Button
                                                    key={months}
                                                    variant={selectedMonths === months ? 'default' : 'outline'}
                                                    onClick={() => setSelectedMonths(months)}
                                                    className="flex flex-col h-auto py-3"
                                                >
                                                    <Calendar className="size-4 mb-1" />
                                                    <span className="text-sm">{months} Bulan</span>
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            onClick={handleExtend}
                                            disabled={extending || !selectedMonths}
                                            className="mt-4 w-full"
                                        >
                                            {extending ? (
                                                <>
                                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="size-4 mr-2" />
                                                    Perpanjang Membership
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Total Members</CardTitle>
                                <CardDescription>Jumlah member aktif dan nonaktif.</CardDescription>
                            </div>
                            <Gauge className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{totalMembers}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Total Kendaraan</CardTitle>
                                <CardDescription>Semua kendaraan terdaftar.</CardDescription>
                            </div>
                            <BarChart3 className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{totalVehicles}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Paket Aktif</CardTitle>
                                <CardDescription>Paket membership tersedia.</CardDescription>
                            </div>
                            <ClipboardPlus className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{activePackages}</p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    {packages.map((pkg) => (
                        <Card
                            key={pkg.id}
                            className="border-sidebar-border/70 bg-card/60 shadow-sm transition hover:border-primary/60 dark:border-sidebar-border"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{pkg.name}</CardTitle>
                                    <Badge variant="outline">{pkg.quota} kendaraan</Badge>
                                </div>
                                <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="text-2xl font-semibold text-foreground">
                                    Rp {pkg.price.toLocaleString('id-ID')}/bulan
                                </div>
                                <ul className="grid gap-2 text-sm text-muted-foreground">
                                    <li>• Kunjungan tanpa batas selama masa aktif.</li>
                                    <li>• Dukungan scan cepat & status real-time.</li>
                                    <li>• Pengingat otomatis menjelang masa habis.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="rounded-xl border border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-2 border-b border-sidebar-border/60 px-6 py-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold">Kuota Kendaraan per Member</h2>
                        <p className="text-sm text-muted-foreground">
                            Monitoring kepemilikan kendaraan pada setiap paket untuk mencegah penyalahgunaan.
                        </p>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-sm">
                            <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Member</th>
                                    <th className="px-4 py-3">Paket</th>
                                    <th className="px-4 py-3">Kendaraan Terdaftar</th>
                                    <th className="px-4 py-3">Quota</th>
                                    <th className="px-4 py-3">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => {
                                    const pkg = packages.find((item) => item.id === member.packageId);
                                    const remaining = (pkg?.quota ?? 0) - member.vehicles.length;
                                    return (
                                        <tr
                                            key={member.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{member.name}</span>
                                                    <span className="text-xs text-muted-foreground">{member.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{pkg?.name}</td>
                                            <td className="px-4 py-3">{member.vehicles.length}</td>
                                            <td className="px-4 py-3">{pkg?.quota}</td>
                                            <td className="px-4 py-3">
                                                {remaining > 0 ? (
                                                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                        Sisa {remaining}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                                        Kuota penuh
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
