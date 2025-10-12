import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { members as membersData, packages } from '@/lib/sample-data';
import { index as statusCheckIndex } from '@/routes/status-check';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Info, Search, XCircle } from 'lucide-react';
import { useMemo } from 'react';

const daysLeft = (expiresAt: string) => {
    const today = new Date();
    const expiry = new Date(expiresAt);
    return Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Status Check', href: statusCheckIndex() },
];

export default function StatusCheck() {
    const member = useMemo(() => membersData[0], []);
    const pkg = packages.find((item) => item.id === member.packageId);

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
                                <Input className="pl-10" placeholder="Scan Card UID" />
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <Input placeholder="atau masukkan nomor telepon (+62)" />
                        </div>
                        <Button className="gap-2">Cek Status</Button>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                    <Card className="border-success/60 bg-success/5 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle>Anggota ditemukan</CardTitle>
                                <CardDescription>
                                    Member aktif, kunjungan diperbolehkan. Detail dibawah menampilkan ringkasan penting.
                                </CardDescription>
                            </div>
                            <CheckCircle2 className="size-6 text-success" />
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Nama</p>
                                <p className="text-lg font-semibold text-foreground">{member.name}</p>
                                <Badge variant="outline">{member.id}</Badge>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                                <p className="text-lg font-medium text-foreground">{member.phone}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Paket</p>
                                <p className="text-lg font-semibold text-foreground">{pkg?.name}</p>
                                <p className="text-xs text-muted-foreground">Quota kendaraan: {pkg?.quota}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Masa Berlaku</p>
                                <p className="text-lg font-medium text-foreground">{member.expiresAt}</p>
                                <p className="text-xs text-muted-foreground">Sisa {daysLeft(member.expiresAt)} hari</p>
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
                                Kendaraan terdaftar: {member.vehicles.map((vehicle) => vehicle.plate).join(', ')}.
                                Jika plat tidak sesuai, blokir kunjungan dan informasikan ke manajer.
                            </CardContent>
                        </Card>
                        <Card className="border-destructive/60 bg-destructive/5 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Tidak ditemukan?</CardTitle>
                                <XCircle className="size-4 text-destructive" />
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Jika hasil pencarian kosong, arahkan pembeli untuk melakukan registrasi dan pastikan UID kartu terdaftar terlebih dahulu sebelum pemakaian.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
