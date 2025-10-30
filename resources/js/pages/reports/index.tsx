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
import { index as reportsIndex } from '@/routes/reports';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarRange, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReportSummary {
    visitsToday: number;
    activeMembers: number;
    newMembersMonth: number;
    vehiclesRegistered: number;
}

interface VisitBarDatum {
    day: string;
    value: number;
}

interface MonthlyDatum {
    month: string;
    value: number;
}

interface PackageSlice {
    name: string;
    percentage: number;
}

interface RecentVisitRow {
    id: number;
    time: string;
    date: string;
    member: {
        name: string;
        code: string;
    };
    plate?: string | null;
    status: 'allowed' | 'blocked';
}

interface ReportsPageProps {
    summary: ReportSummary;
    visitsByDay: VisitBarDatum[];
    visitsTrend?: {
        percentage: number;
        direction: 'up' | 'down' | 'equal';
    };
    monthlyNewMembers: MonthlyDatum[];
    packageDistribution: PackageSlice[];
    recentVisits: {
        data: RecentVisitRow[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        total: number;
        from: number | null;
        to: number | null;
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: reportsIndex().url },
];

export default function ReportsPage() {
    const { summary, visitsByDay, visitsTrend, monthlyNewMembers, packageDistribution, recentVisits } = usePage<ReportsPageProps>().props;
    const urlParams = new URLSearchParams(window.location.search);
    const urlRange = urlParams.get('range') || 'this-week';
    const urlStartDate = urlParams.get('start_date') || '';
    const urlEndDate = urlParams.get('end_date') || '';
    
    const [rangeType, setRangeType] = useState<string>(urlRange);
    const [startDate, setStartDate] = useState<string>(urlStartDate);
    const [endDate, setEndDate] = useState<string>(urlEndDate);
    const [isCustom, setIsCustom] = useState(urlRange === 'custom');

    useEffect(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        if (rangeType === 'today') {
            setStartDate(todayStr);
            setEndDate(todayStr);
            setIsCustom(false);
        } else if (rangeType === 'this-week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 6);
            setStartDate(weekAgo.toISOString().split('T')[0]);
            setEndDate(todayStr);
            setIsCustom(false);
        } else if (rangeType === 'this-month') {
            const monthAgo = new Date(today);
            monthAgo.setDate(today.getDate() - 29);
            setStartDate(monthAgo.toISOString().split('T')[0]);
            setEndDate(todayStr);
            setIsCustom(false);
        } else if (rangeType === 'custom') {
            setIsCustom(true);
            if (!startDate) {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 6);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(todayStr);
            }
        }
    }, [rangeType]);

    const handleApplyFilter = () => {
        if (rangeType === 'custom' && (!startDate || !endDate)) {
            return;
        }
        
        router.get(reportsIndex().url, {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            range: rangeType,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                            <Select value={rangeType} onValueChange={setRangeType}>
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
                            <Input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={!isCustom}
                                className={!isCustom ? 'opacity-50' : ''}
                            />
                            <Input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={!isCustom}
                                className={!isCustom ? 'opacity-50' : ''}
                            />
                            <Button variant="outline" className="gap-2" onClick={handleApplyFilter}>
                                <CalendarRange className="size-4" /> Terapkan
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>Total Visits</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{summary.visitsToday}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>Active Members</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{summary.activeMembers}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>New Members (30 hari)</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{summary.newMembersMonth}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardDescription>Vehicles Registered</CardDescription>
                            <CardTitle className="text-3xl font-semibold">{summary.vehiclesRegistered}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Visits per Day</CardTitle>
                                <CardDescription>Tren kunjungan 7 hari terakhir.</CardDescription>
                            </div>
                            {visitsTrend && visitsTrend.direction !== 'equal' ? (
                                <Badge 
                                    variant="outline" 
                                    className={`gap-2 ${
                                        visitsTrend.direction === 'up' 
                                            ? 'text-success border-success/20' 
                                            : 'text-destructive border-destructive/20'
                                    }`}
                                >
                                    {visitsTrend.direction === 'up' ? (
                                        <TrendingUp className="size-4" />
                                    ) : (
                                        <TrendingDown className="size-4" />
                                    )}
                                    {visitsTrend.direction === 'up' ? 'Naik' : 'Turun'} {visitsTrend.percentage}%
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="gap-2 text-muted-foreground">
                                    Sama dengan periode sebelumnya
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="flex h-64 items-end gap-2 p-6">
                            <TooltipProvider>
                                {visitsByDay.map((item) => {
                                    const maxValue = Math.max(...visitsByDay.map(v => v.value), 1);
                                    const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                    // Maksimal height 180px agar tidak overlap dengan text (container h-64 = 256px, dikurangi padding dan space untuk label)
                                    const maxBarHeight = 180;
                                    const calculatedHeight = Math.max((heightPercentage / 100) * maxBarHeight, 8);
                                    return (
                                        <Tooltip key={item.day}>
                                            <TooltipTrigger asChild>
                                                <div className="flex flex-1 flex-col justify-end cursor-pointer h-full">
                                                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                                                        <div
                                                            className="w-full rounded-md bg-primary transition-all hover:bg-primary/80"
                                                            style={{ 
                                                                height: `${calculatedHeight}px`,
                                                                maxHeight: `${maxBarHeight}px`,
                                                            }}
                                                        />
                                                        <span className="text-xs text-muted-foreground mt-1">{item.day}</span>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-semibold">{item.day}</p>
                                                <p className="text-xs">{item.value} kunjungan</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </TooltipProvider>
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
                            {packageDistribution.length > 0 ? (
                                <>
                                    <TooltipProvider>
                                        <div className="relative mx-auto size-40">
                                            {packageDistribution.map((item, index) => {
                                                // Menggunakan chart colors yang sudah didefinisikan di CSS (dalam format hex)
                                                const chartColors = [
                                                    '#f6b800', // chart-1 (primary yellow)
                                                    '#ffe08a', // chart-2 (light yellow)
                                                    '#d79b19', // chart-3 (medium yellow)
                                                    '#a4720a', // chart-4 (dark yellow)
                                                    '#3b2f1b', // chart-5 (dark brown)
                                                ];
                                                const fillColor = chartColors[index % chartColors.length];
                                                
                                                const cumulativeBefore = packageDistribution.slice(0, index).reduce((sum, p) => sum + p.percentage, 0);
                                                const percentageStart = cumulativeBefore;
                                                const percentageEnd = cumulativeBefore + item.percentage;
                                                
                                                // Convert percentage to degrees (starting from top, clockwise)
                                                const startAngle = (percentageStart / 100) * 360 - 90;
                                                const endAngle = (percentageEnd / 100) * 360 - 90;
                                                
                                                // Create SVG path for pie slice
                                                const radius = 50;
                                                const centerX = 50;
                                                const centerY = 50;
                                                const startRad = (startAngle * Math.PI) / 180;
                                                const endRad = (endAngle * Math.PI) / 180;
                                                
                                                const x1 = centerX + radius * Math.cos(startRad);
                                                const y1 = centerY + radius * Math.sin(startRad);
                                                const x2 = centerX + radius * Math.cos(endRad);
                                                const y2 = centerY + radius * Math.sin(endRad);
                                                
                                                const largeArcFlag = item.percentage > 50 ? 1 : 0;
                                                
                                                const pathData = [
                                                    `M ${centerX} ${centerY}`,
                                                    `L ${x1} ${y1}`,
                                                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                    'Z'
                                                ].join(' ');
                                                
                                                return (
                                                    <Tooltip key={item.name}>
                                                        <TooltipTrigger asChild>
                                                            <svg className="absolute inset-0 size-full cursor-pointer" viewBox="0 0 100 100">
                                                                <path
                                                                    d={pathData}
                                                                    fill={fillColor}
                                                                    className="opacity-80 hover:opacity-100 transition-opacity"
                                                                />
                                                            </svg>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="font-semibold">{item.name}</p>
                                                            <p className="text-xs">{item.percentage}% dari total</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                            <div className="absolute inset-4 rounded-full bg-card/90 backdrop-blur flex items-center justify-center shadow-sm pointer-events-none">
                                                <span className="text-xs font-semibold text-foreground">Total</span>
                                            </div>
                                        </div>
                                    </TooltipProvider>
                                    <ul className="grid gap-2 text-sm text-muted-foreground">
                                        {packageDistribution.map((item, index) => {
                                            const chartColors = [
                                                '#f6b800', // chart-1
                                                '#ffe08a', // chart-2
                                                '#d79b19', // chart-3
                                                '#a4720a', // chart-4
                                                '#3b2f1b', // chart-5
                                            ];
                                            const chartColor = chartColors[index % chartColors.length];
                                            return (
                                                <li key={item.name} className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                        <div 
                                                            className="size-2 rounded-full" 
                                                            style={{ backgroundColor: chartColor }}
                                                        />
                                                        <span style={{ color: chartColor, fontWeight: 500 }}>{item.name}</span>
                                                    </span>
                                                    <span className="font-semibold text-foreground">{item.percentage}%</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            ) : (
                                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                                    Tidak ada data
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Monthly New Members</CardTitle>
                            <CardDescription>Perbandingan 6 bulan terakhir.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex h-60 items-end gap-2 p-6">
                            <TooltipProvider>
                                {monthlyNewMembers.map((item) => {
                                    const maxValue = Math.max(...monthlyNewMembers.map(v => v.value), 1);
                                    const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                    // Maksimal height 160px untuk container h-60 (240px)
                                    const maxBarHeight = 160;
                                    const calculatedHeight = Math.max((heightPercentage / 100) * maxBarHeight, 8);
                                    return (
                                        <Tooltip key={item.month}>
                                            <TooltipTrigger asChild>
                                                <div className="flex flex-1 flex-col items-center gap-2 cursor-pointer h-full">
                                                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                                                        <div
                                                            className="w-full rounded-md bg-primary/70 transition-all hover:bg-primary/90"
                                                            style={{ 
                                                                height: `${calculatedHeight}px`,
                                                                maxHeight: `${maxBarHeight}px`,
                                                            }}
                                                        />
                                                        <span className="text-xs text-muted-foreground mt-1">{item.month}</span>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-semibold">{item.month}</p>
                                                <p className="text-xs">{item.value} member baru</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </TooltipProvider>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Detail Kunjungan</CardTitle>
                            <CardDescription>Daftar kunjungan terkini.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">Waktu</th>
                                            <th className="px-4 py-3">Plat</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentVisits.data.map((visit) => (
                                            <tr
                                                key={visit.id}
                                                className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{visit.member.name}</span>
                                                        <span className="text-xs text-muted-foreground">{visit.member.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{visit.date}</span>
                                                        <span className="text-xs text-muted-foreground">{visit.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{visit.plate ?? '-'}</td>
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
                            <div className="flex flex-col items-center gap-2 border-t border-sidebar-border/60 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:justify-between dark:border-sidebar-border">
                                <span>
                                    Menampilkan {recentVisits.from ?? 0}–{recentVisits.to ?? 0} dari {recentVisits.total} kunjungan
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    {recentVisits.links.map((link, index) => {
                                        const isDisabled = link.url === null;
                                        const isActive = link.active;
                                        const label = link.label
                                            .replace('&laquo;', '‹')
                                            .replace('&raquo;', '›');

                                        return (
                                            <Button
                                                key={`${link.label}-${index}`}
                                                variant={isActive ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={isDisabled || isActive}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.visit(link.url, {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                        });
                                                    }
                                                }}
                                                className={isActive ? 'cursor-default' : ''}
                                            >
                                                {label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
