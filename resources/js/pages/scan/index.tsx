import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { scanHistory } from '@/lib/sample-data';
import { scanIndex } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, History, RefreshCcw, ScanLine } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Scan', href: scanIndex() },
];

export default function ScanPage() {
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
                        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
                            <label htmlFor="scan-input" className="text-xs font-medium uppercase tracking-wide text-primary">
                                Card UID
                            </label>
                            <div className="relative">
                                <ScanLine className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-primary" />
                                <Input
                                    id="scan-input"
                                    className="h-16 text-center text-3xl tracking-[0.3em]"
                                    placeholder="UID"
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>Tekan Enter untuk proses scan</span>
                                <Button variant="ghost" size="sm" className="gap-2 text-primary">
                                    <RefreshCcw className="size-4" /> Reset Input
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 rounded-xl border border-success/40 bg-success/10 p-6 text-success">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="size-6" />
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide">Allowed</p>
                                    <p className="text-sm text-success/80">
                                        Agus Pratama • Paket Plus • Kendaraan: D 1234 ABC
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-success/80">
                                <span>Scan ke-42 hari ini</span>
                                <span>•</span>
                                <span>Jam 08:02 WIB</span>
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
                            <History className="size-4" /> Total {scanHistory.length}
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
                                    {scanHistory.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">{row.time}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{row.memberName}</span>
                                                    <span className="text-xs text-muted-foreground">{row.status.includes('Blocked') ? 'Perlu perhatian' : 'Lolos'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{row.plate}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={row.status.startsWith('Blocked') ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20'}
                                                >
                                                    {row.status}
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
