import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { backupLogs, syncStatus } from '@/lib/sample-data';
import { index as backupIndex } from '@/routes/backup';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Cloud, Loader2, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Backup', href: backupIndex() },
];

export default function BackupPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backup" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Cloud className="size-6 text-primary" />
                            <div>
                                <CardTitle>Google Sheets Backup</CardTitle>
                                <CardDescription>Pantau status koneksi dan jalankan sinkronisasi manual.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                        <div className="rounded-xl border border-sidebar-border/70 bg-muted/20 p-6 dark:border-sidebar-border">
                            <div className="flex items-center gap-3 text-sm">
                                <Badge
                                    variant="outline"
                                    className={syncStatus.connected ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}
                                >
                                    {syncStatus.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <span className="text-muted-foreground">Last sync: {syncStatus.lastSync}</span>
                            </div>
                            <div className="mt-4 flex flex-col gap-3">
                                <label className="text-sm font-medium text-foreground">Web App URL</label>
                                <Input defaultValue={syncStatus.webAppUrl} />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" className="gap-2">
                                    <Loader2 className="size-4 animate-spin" /> Test Connection
                                </Button>
                                <Button className="gap-2">
                                    <RefreshCw className="size-4" /> Sync Now
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-success/40 bg-success/10 p-6 text-sm text-success">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="size-5" />
                                <div>
                                    <p className="font-medium">Rekomendasi</p>
                                    <ul className="mt-2 grid gap-1 text-success/80">
                                        <li>• Sinkronisasi otomatis setiap jam 06:00.</li>
                                        <li>• Owner menerima email ringkasan jika sync gagal.</li>
                                        <li>• Gunakan service account khusus untuk akses Google Sheets.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Riwayat Sinkronisasi</CardTitle>
                            <CardDescription>Log tersedia untuk audit dan troubleshooting.</CardDescription>
                        </div>
                        <Badge variant="outline">Format: Google Sheets</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backupLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">{log.timestamp}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={log.status === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}
                                                >
                                                    {log.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{log.message}</td>
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
