import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as cardReplacementIndex } from '@/routes/card-replacement';
import { create as membersCreate } from '@/routes/members';
import { index as reportsIndex } from '@/routes/reports';
import { index as scanIndex } from '@/routes/scan';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BarChart3, CreditCard, IdCard, PlusCircle, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardPageProps {
    summary: {
        totalMembers: number;
        activeMembers: number;
        visitsToday: number;
        totalVehicles: number;
        newMembersToday: number;
        visitGrowth: number;
        avgVehiclesPerMember: number;
    };
    visitsByDay: Array<{
        day: string;
        value: number;
        date: string;
    }>;
    maxVisits: number;
    pendingCardRequests: Array<{
        id: number;
        memberId: string;
        memberName: string;
        oldUid: string;
        newUid: string;
        reason: string;
        reasonNote?: string;
        requestedAt: string;
    }>;
    todayVisits: Array<{
        id: number;
        time: string;
        memberName: string;
        memberId: string;
        plate: string | null;
        status: string;
    }>;
    [key: string]: unknown;
}

export default function Dashboard() {
    const { summary, visitsByDay, maxVisits, pendingCardRequests, todayVisits } = usePage<DashboardPageProps>().props;

    // Calculate chart bar height (max 240px)
    const maxBarHeight = 240;
    const calculateBarHeight = (value: number) => {
        if (maxVisits === 0) return 0;
        const heightPercentage = (value / maxVisits) * 100;
        return Math.max(20, (heightPercentage / 100) * maxBarHeight);
    };

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
                            <p className="text-3xl font-semibold">{summary.totalMembers}</p>
                            {summary.newMembersToday > 0 && (
                                <p className="text-xs text-success">+{summary.newMembersToday} hari ini</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Active Members</CardDescription>
                            <CreditCard className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{summary.activeMembers}</p>
                            <p className="text-xs text-muted-foreground">
                                {summary.totalMembers > 0 
                                    ? Math.round((summary.activeMembers / summary.totalMembers) * 100) 
                                    : 0}% dari total
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Today&apos;s Visits</CardDescription>
                            <BarChart3 className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{summary.visitsToday}</p>
                            {summary.visitGrowth !== 0 && (
                                <p className={`text-xs ${summary.visitGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                                    {summary.visitGrowth > 0 ? '+' : ''}{summary.visitGrowth}% vs. kemarin
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardDescription>Total Vehicles</CardDescription>
                            <ArrowUpRight className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{summary.totalVehicles}</p>
                            <p className="text-xs text-muted-foreground">
                                Rata-rata {summary.avgVehiclesPerMember} kendaraan/member
                            </p>
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
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                                <Link href={reportsIndex().url}>Detail Report</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex h-72 items-end gap-4 p-6">
                            {visitsByDay.length === 0 ? (
                                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                                    Tidak ada data kunjungan
                                </div>
                            ) : (
                                visitsByDay.map((item) => (
                                    <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                                        <div className="flex h-full w-full flex-col justify-end">
                                            <div
                                                className="w-full rounded-md bg-primary transition-all hover:bg-primary/80"
                                                style={{ height: `${calculateBarHeight(item.value)}px` }}
                                            />
                                            <span className="mt-1 text-xs text-muted-foreground">{item.value}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{item.day}</span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pending Card Replacement</CardTitle>
                                <CardDescription>Perlu persetujuan Owner.</CardDescription>
                            </div>
                            <IdCard className="size-5 text-primary" />
                        </CardHeader>
                        <CardContent className="grid gap-4 p-6">
                            {pendingCardRequests.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">Tidak ada request pending</p>
                            ) : (
                                <>
                                    {pendingCardRequests.map((request) => (
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
                                </>
                            )}
                            <Button variant="outline" className="gap-2" asChild>
                                <Link href={cardReplacementIndex().url}>
                                    <PlusCircle className="size-4" /> Lihat semua request
                                </Link>
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
                                        {todayVisits.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                    Tidak ada kunjungan hari ini
                                                </td>
                                            </tr>
                                        ) : (
                                            todayVisits.map((visit) => (
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
                                                    <td className="px-4 py-3">{visit.plate || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={visit.status === 'allowed' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}
                                                        >
                                                            {visit.status === 'allowed' ? 'Allowed' : 'Blocked'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
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
                            <Button variant="outline" className="justify-start gap-3" asChild>
                                <Link href={membersCreate().url}>
                                    <PlusCircle className="size-4 text-primary" /> Add Member
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start gap-3" asChild>
                                <Link href={reportsIndex().url}>
                                    <BarChart3 className="size-4 text-primary" /> Open Reports
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start gap-3" asChild>
                                <Link href={scanIndex().url}>
                                    <IdCard className="size-4 text-primary" /> Start Scan Mode
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
