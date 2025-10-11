import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { members, packages } from '@/lib/sample-data';
import { membershipIndex } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3, ClipboardPlus, Gauge, Info } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Membership',
        href: membershipIndex(),
    },
];

export default function MembershipOverview() {
    const totalMembers = members.length;
    const totalVehicles = members.reduce((acc, item) => acc + item.vehicles.length, 0);
    const activePackages = packages.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership" />
            <div className="flex flex-1 flex-col gap-6 p-4">
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
                                <Button variant="outline" className="gap-2">
                                    <Info className="size-4" /> Lihat detail paket
                                </Button>
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
