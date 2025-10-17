import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { index as scanIndex, store as scanStore } from '@/routes/scan';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { CheckCircle2, History, RefreshCcw, ScanLine, XCircle } from 'lucide-react';

type ScanResult = {
    status: 'allowed' | 'blocked';
    member?: {
        id: string;
        name: string;
        package: string;
        status: string;
    };
    reason?: string;
};

type TodayVisit = {
    id: number;
    time: string;
    member: {
        id: string;
        name: string;
    };
    plate?: string | null;
    status: 'allowed' | 'blocked';
};

interface ScanPageProps {
    todayVisits: TodayVisit[];
    lastScan?: TodayVisit;
    flash: {
        scan?: {
            result?: ScanResult;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Scan', href: scanIndex().url }];

export default function ScanPage() {
    const { todayVisits, lastScan: lastScanProp, flash } = usePage<{ todayVisits: TodayVisit[]; lastScan?: TodayVisit; flash: ScanPageProps['flash']; }>();
    const currentVisits = todayVisits ?? [];
    const flashResult = flash?.scan?.result ?? null;
    const { data, setData, post, processing, reset } = useForm({
        card_uid: '',
    });

    const lastScan = useMemo(() => {
        if (flashResult) {
            return flashResult;
        }

        if (lastScanProp) {
            return {
                status: lastScanProp.status,
                member: {
                    id: lastScanProp.member.id,
                    name: lastScanProp.member.name,
                    package: '',
                    status: '',
                },
            } satisfies ScanResult;
        }

        return null;
    }, [flashResult, lastScanProp]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(scanStore().url, {
            preserveScroll: true,
            onSuccess: () => reset('card_uid'),
        });
    };

    const alertVariant = lastScan?.status === 'allowed' ? 'success' : lastScan?.status === 'blocked' ? 'destructive' : 'muted';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Scan" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-lg dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Scan Kartu Membership</CardTitle>
                        <CardDescription>
                            Fokuskan input, tempelkan kartu RFID, dan tekan enter. Sistem akan menampilkan hasil scan secara real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
                            <label htmlFor="scan-input" className="text-xs font-medium uppercase tracking-wide text-primary">
                                Card UID
                            </label>
                            <div className="relative">
                                <ScanLine className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-primary" />
                                <Input
                                    id="scan-input"
                                    name="card_uid"
                                    value={data.card_uid}
                                    onChange={(event) => setData('card_uid', event.target.value)}
                                    className="h-16 text-center text-3xl tracking-[0.3em]"
                                    placeholder="UID"
                                    disabled={processing}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>Tekan Enter untuk proses scan</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-primary"
                                    onClick={() => setData('card_uid', '')}
                                >
                                    <RefreshCcw className="size-4" /> Reset Input
                                </Button>
                            </div>
                            <Button type="submit" className="hidden" disabled={processing}>
                                Submit
                            </Button>
                        </form>
                        <div
                            className={`flex flex-col gap-4 rounded-xl border p-6 ${
                                alertVariant === 'success'
                                    ? 'border-success/40 bg-success/10 text-success'
                                    : alertVariant === 'destructive'
                                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                      : 'border-muted/40 bg-muted/10 text-muted-foreground'
                            }`}
                        >
                            {lastScan ? (
                                <div className="flex items-start gap-2">
                                    {lastScan.status === 'allowed' ? (
                                        <CheckCircle2 className="size-6" />
                                    ) : (
                                        <XCircle className="size-6" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-wide">
                                            {lastScan.status === 'allowed' ? 'Allowed' : 'Blocked'}
                                        </p>
                                        <p className="text-sm">
                                            {lastScan.member?.name ?? flashResult?.reason ?? 'Hasil scan ditampilkan di sini.'}
                                        </p>
                                        {lastScan.member?.package && (
                                            <p className="text-xs text-muted-foreground">
                                                Paket: {lastScan.member.package} • Status: {lastScan.member.status}
                                            </p>
                                        )}
                                        {flashResult?.reason && (
                                            <p className="text-xs text-muted-foreground">Alasan: {flashResult.reason}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Belum ada scan hari ini.</div>
                            )}
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                                <span>{currentVisits.length} scan tercatat hari ini</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Riwayat Scan Hari Ini</CardTitle>
                            <CardDescription>Catatan realtime untuk audit dan verifikasi kunjungan.</CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-2">
                            <History className="size-4" /> Total {currentVisits.length}
                        </Badge>
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
                                    {currentVisits.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">{row.time}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{row.member.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {row.status === 'allowed' ? 'Lolos' : 'Perlu perhatian'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{row.plate ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        row.status === 'blocked'
                                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                            : 'bg-success/10 text-success border-success/20'
                                                    }
                                                >
                                                    {row.status === 'allowed' ? 'Allowed' : 'Blocked'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
