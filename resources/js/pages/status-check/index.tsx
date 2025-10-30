import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { index as statusCheckIndex, check as statusCheckCheck } from '@/routes/status-check';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Info, Loader2, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Status Check', href: statusCheckIndex().url },
];

interface MemberData {
    id: string;
    member_code: string;
    name: string;
    phone: string;
    package: string;
    package_name: string;
    package_quota: number;
    status: string;
    expires_at: string | null;
    days_left: number;
    is_active: boolean;
    vehicles: Array<{ plate: string; color: string }>;
}

export default function StatusCheck() {
    const [cardUid, setCardUid] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [member, setMember] = useState<MemberData | null>(null);
    const [notFound, setNotFound] = useState(false);

    const handleCheckStatus = async () => {
        if (!cardUid.trim() && !phone.trim()) {
            return;
        }

        setLoading(true);
        setMember(null);
        setNotFound(false);

        try {
            const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            
            const response = await fetch(statusCheckCheck().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    card_uid: cardUid.trim() || null,
                    phone: phone.trim() || null,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Ensure vehicles array is properly set
                const memberData = {
                    ...data.member,
                    vehicles: data.member.vehicles || [],
                };
                setMember(memberData);
                setNotFound(false);
            } else {
                setNotFound(true);
                setMember(null);
            }
        } catch (error) {
            console.error(error);
            setNotFound(true);
            setMember(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCheckStatus();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Status Check" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Status Membership</CardTitle>
                        <CardDescription>
                            Masukkan Card UID atau nomor telepon untuk memeriksa status keanggotaan secara langsung.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 md:flex-row">
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    placeholder="Scan Card UID"
                                    value={cardUid}
                                    onChange={(e) => {
                                        setCardUid(e.target.value);
                                        if (e.target.value) setPhone('');
                                    }}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <Input
                                placeholder="atau masukkan nomor telepon (08xxxxxxxxxx)"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (e.target.value) setCardUid('');
                                }}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                        </div>
                        <Button className="gap-2" onClick={handleCheckStatus} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" /> Memeriksa...
                                </>
                            ) : (
                                <>
                                    <Search className="size-4" /> Cek Status
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {member && (
                    <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                        <Card
                            className={`border-sidebar-border/70 shadow-sm dark:border-sidebar-border ${
                                member.is_active
                                    ? 'border-success/60 bg-success/5'
                                    : 'border-destructive/60 bg-destructive/5'
                            }`}
                        >
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle>
                                        {member.is_active ? 'Anggota ditemukan' : 'Anggota tidak aktif'}
                                    </CardTitle>
                                    <CardDescription>
                                        {member.is_active
                                            ? 'Member aktif, kunjungan diperbolehkan. Detail dibawah menampilkan ringkasan penting.'
                                            : 'Member tidak aktif atau membership sudah kedaluwarsa.'}
                                    </CardDescription>
                                </div>
                                {member.is_active ? (
                                    <CheckCircle2 className="size-6 text-success" />
                                ) : (
                                    <XCircle className="size-6 text-destructive" />
                                )}
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Nama</p>
                                    <p className="text-lg font-semibold text-foreground">{member.name}</p>
                                    <Badge variant="outline">{member.member_code}</Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                                    <p className="text-lg font-medium text-foreground">{member.phone}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Paket</p>
                                    <p className="text-lg font-semibold text-foreground">{member.package_name}</p>
                                    <p className="text-xs text-muted-foreground">Quota kendaraan: {member.package_quota}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Masa Berlaku</p>
                                    {member.expires_at ? (
                                        <>
                                            <p className="text-lg font-medium text-foreground">{member.expires_at}</p>
                                            <p className="text-xs text-muted-foreground">Sisa {Math.ceil(member.days_left)} hari</p>
                                        </>
                                    ) : (
                                        <p className="text-lg font-medium text-destructive">Tidak ada membership aktif</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            <Card className="border-warning/60 bg-warning/5 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base">Pastikan identitas kendaraan</CardTitle>
                                    <Info className="size-4 text-warning" />
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    {member.vehicles.length > 0 ? (
                                        <>
                                            Kendaraan terdaftar:{' '}
                                            <strong>{member.vehicles.map((v) => v.plate).join(', ')}</strong>.
                                            <br />
                                            Jika plat tidak sesuai, blokir kunjungan dan informasikan ke owner.
                                        </>
                                    ) : (
                                        'Tidak ada kendaraan terdaftar untuk member ini.'
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {notFound && !member && (
                    <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                        <Card className="border-destructive/60 bg-destructive/5 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Member tidak ditemukan</CardTitle>
                                <XCircle className="size-6 text-destructive" />
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Tidak ada member yang ditemukan dengan Card UID atau nomor telepon yang diberikan. Pastikan
                                data yang dimasukkan benar atau member sudah terdaftar di sistem.
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            <Card className="border-destructive/60 bg-destructive/5 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base">Tidak ditemukan?</CardTitle>
                                    <XCircle className="size-4 text-destructive" />
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    Jika hasil pencarian kosong, arahkan pembeli untuk melakukan registrasi dan pastikan
                                    UID kartu terdaftar terlebih dahulu sebelum pemakaian.
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
