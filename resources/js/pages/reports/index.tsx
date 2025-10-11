import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    monthlyNewMembers,
    packageDistribution,
    reportsSummary,
    todayVisits,
    visitsByDay,
} from '@/lib/sample-data';
import { reportsIndex } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CalendarRange, Download, PieChart, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: reportsIndex() },
];

export default function ReportsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <CardTitle>Laporan Kinerja & Analitik</CardTitle>
                            <CardDescription>
                                Pantau kunjungan harian, distribusi paket, dan tren pendaftaran untuk pengambilan keputusan.
                            </CardDescription>
                        </div>
                        <div className="grid gap-3 md:grid-cols-4">
                            <Select defaultValue="this-week">
                                <SelectTrigger>
                                    <SelectValue placeholder="Rentang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Hari ini</SelectItem>
                                    <SelectItem value="this-week">7 hari terakhir</SelectItem>
                                    <SelectItem value="this-month">30 hari terakhir</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="date" defaultValue="2025-01-01" />
                            <Input type="date" defaultValue="2025-01-07" />
                            <Button variant="outline" className="gap-2">
                                <CalendarRange className="size-4" /> Terapkan
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>Total Visits</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{reportsSummary.visitsToday}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-success">
                            +12% dibanding minggu lalu
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>Active Members</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{reportsSummary.activeMembers}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Termasuk perpanjangan otomatis
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>New Members (30 hari)</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{reportsSummary.newMembersMonth}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-success">
                            +5 anggota dibanding periode sebelumnya
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>Vehicles Registered</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{reportsSummary.vehiclesRegistered}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            {Math.round(reportsSummary.vehiclesRegistered / reportsSummary.activeMembers)} kendaraan per member
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Visits per Day</CardTitle>
                                <CardDescription>Tren kunjungan 7 hari terakhir.</CardDescription>
                            </div>
                            <Badge variant="outline" className="gap-2">
                                <TrendingUp className="size-4" /> Naik 8%
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex h-64 items-end gap-4 p-6">
                            {visitsByDay.map((item) => (
                                <div key={item.day} className="flex flex-1 flex-col justify-end">
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className="w-full rounded-md bg-primary"
                                            style={{ height: `${item.value / 2}px` }}
                                        />
                                        <span className="text-xs text-muted-foreground">{item.day}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Distribusi Paket</CardTitle>
                                <CardDescription>Persentase member per paket.</CardDescription>
                            </div>
                            <PieChart className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="relative mx-auto size-40">
                                <div className="absolute inset-0 rounded-full border-[12px] border-primary/70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)' }} />
                                <div className="absolute inset-0 rounded-full border-[12px] border-success/70" style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)' }} />
                                <div className="absolute inset-4 rounded-full bg-card/80 backdrop-blur" />
                            </div>
                            <ul className="grid gap-2 text-sm text-muted-foreground">
                                {packageDistribution.map((item) => (
                                    <li key={item.name} className="flex items-center justify-between">
                                        <span>{item.name}</span>
                                        <span className="font-semibold text-foreground">{item.percentage}%</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Monthly New Members</CardTitle>
                            <CardDescription>Perbandingan 6 bulan terakhir.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex h-60 items-end gap-4 p-6">
                            {monthlyNewMembers.map((item) => (
                                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                                    <div
                                        className="w-full rounded-md bg-primary/70"
                                        style={{ height: `${item.value * 4}px` }}
                                    />
                                    <span className="text-xs text-muted-foreground">{item.month}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Visits Detail</CardTitle>
                                <CardDescription>List kunjungan dalam rentang terpilih.</CardDescription>
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Download className="size-4" /> Export CSV
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">Jam</th>
                                            <th className="px-4 py-3">Plat</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayVisits.map((visit) => (
                                            <tr
                                                key={visit.id}
                                                className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{visit.memberName}</span>
                                                        <span className="text-xs text-muted-foreground">{visit.memberId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{visit.time}</td>
                                                <td className="px-4 py-3">{visit.plate}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={visit.status === 'allowed' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}
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
                </section>
            </div>
        </AppLayout>
    );
}
