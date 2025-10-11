import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cardReplacementRequests, reportsSummary, todayVisits, visitsByDay } from '@/lib/sample-data';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, BarChart3, CreditCard, IdCard, PlusCircle, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Total Members</CardDescription>
                            <Users className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{reportsSummary.activeMembers}</p>
                            <p className="text-xs text-success">+12 hari ini</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Active Members</CardDescription>
                            <CreditCard className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{reportsSummary.activeMembers}</p>
                            <p className="text-xs text-muted-foreground">92% retention</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Today&apos;s Visits</CardDescription>
                            <BarChart3 className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{reportsSummary.visitsToday}</p>
                            <p className="text-xs text-success">+8% vs. kemarin</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Total Vehicles</CardDescription>
                            <ArrowUpRight className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{reportsSummary.vehiclesRegistered}</p>
                            <p className="text-xs text-muted-foreground">Rata-rata 1.4 kendaraan/member</p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Visits Chart</CardTitle>
                                <CardDescription>Grafik kunjungan 7 hari terakhir.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                Detail Report
                            </Button>
                        </CardHeader>
                        <CardContent className="flex h-72 items-end gap-4 p-6">
                            {visitsByDay.map((item) => (
                                <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                                    <div
                                        className="w-full rounded-md bg-primary"
                                        style={{ height: `${item.value / 2}px` }}
                                    />
                                    <span className="text-xs text-muted-foreground">{item.day}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pending Card Replacement</CardTitle>
                                <CardDescription>Perlu persetujuan Manager / Owner.</CardDescription>
                            </div>
                            <IdCard className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent className="grid gap-4 p-6">
                            {cardReplacementRequests.pending.map((request) => (
                                <div
                                    key={request.id}
                                    className="rounded-lg border border-sidebar-border/70 bg-muted/20 p-4 text-sm dark:border-sidebar-border"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{request.memberName}</span>
                                            <span className="text-xs text-muted-foreground">{request.memberId}</span>
                                        </div>
                                        <Badge variant="outline">{request.reason}</Badge>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {request.requestedAt} • UID baru: {request.newUid}
                                    </p>
                                </div>
                            ))}
                            <Button variant="outline" className="gap-2">
                                <PlusCircle className="size-4" /> Lihat semua request
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Today&apos;s Membership Visits</CardTitle>
                            <CardDescription>Pantau kunjungan terakhir untuk audit cepat.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Jam</th>
                                            <th className="px-4 py-3">Member</th>
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
                                                <td className="px-4 py-3">{visit.time}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{visit.memberName}</span>
                                                        <span className="text-xs text-muted-foreground">{visit.memberId}</span>
                                                    </div>
                                                </td>
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

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Gunakan pintasan ini untuk aksi harian yang paling sering dikerjakan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button variant="outline" className="justify-start gap-3">
                                <PlusCircle className="size-4 text-primary" /> Add Member
                            </Button>
                            <Button variant="outline" className="justify-start gap-3">
                                <BarChart3 className="size-4 text-primary" /> Open Reports
                            </Button>
                            <Button variant="outline" className="justify-start gap-3">
                                <IdCard className="size-4 text-primary" /> Start Scan Mode
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
