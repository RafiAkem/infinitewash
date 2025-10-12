import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cardReplacementRequests, members } from '@/lib/sample-data';
import { index as cardReplacementIndex } from '@/routes/card-replacement';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Check, Download, Upload, UserRoundSearch, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Card Replacement', href: cardReplacementIndex() },
];

const tabs = [
    { key: 'pending', label: 'Pending Approvals' },
    { key: 'history', label: 'History' },
];

export default function CardReplacementPage() {
    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const pending = cardReplacementRequests.pending;
    const history = cardReplacementRequests.history;
    const sampleMember = useMemo(() => members[0], []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Card Replacement" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Ajukan Penggantian Kartu</CardTitle>
                            <CardDescription>
                                Cari member, input UID baru, dan unggah bukti kehilangan atau kerusakan sebelum request diproses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="member-search">Cari Member</Label>
                                <div className="relative">
                                    <UserRoundSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="member-search"
                                        className="pl-10"
                                        placeholder="Nama atau nomor telepon"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Contoh hasil: {sampleMember.name} • {sampleMember.phone}
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="old-uid">Old UID</Label>
                                    <Input id="old-uid" placeholder="UID lama" defaultValue="UID-883421" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="new-uid">New UID</Label>
                                    <Input id="new-uid" placeholder="Scan UID baru" />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="reason">Alasan</Label>
                                    <Input id="reason" placeholder="Hilang/Damaged/Stolen/Other" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="proof">Bukti (foto)</Label>
                                    <Button variant="outline" className="gap-2" id="proof">
                                        <Upload className="size-4" /> Unggah File
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea id="notes" placeholder="Catatan tambahan untuk approver" rows={3} />
                            </div>
                            <Button className="self-start">Submit Request</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Guideline Approval</CardTitle>
                            <CardDescription>
                                Pastikan permintaan di-review oleh Manager atau Owner sesuai matrix permission Spatie.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm text-muted-foreground">
                            <p>• Wajib lampirkan bukti foto atau surat keterangan.</p>
                            <p>• UID baru tidak boleh pernah digunakan sebelumnya.</p>
                            <p>• Status member harus Active sebelum kartu diganti.</p>
                            <p>• Semua perubahan tercatat di audit log.</p>
                            <Button variant="outline" className="gap-2 self-start">
                                <Download className="size-4" /> Unduh SOP Penggantian
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-2">
                            {tabs.map((tab) => (
                                <Button
                                    key={tab.key}
                                    variant={activeTab === tab.key ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </div>
                        <Badge variant="outline">Guard: web</Badge>
                    </div>

                    {activeTab === 'pending' && (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-sm">
                                <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Member</th>
                                        <th className="px-4 py-3">Old UID</th>
                                        <th className="px-4 py-3">New UID</th>
                                        <th className="px-4 py-3">Reason</th>
                                        <th className="px-4 py-3">Proof</th>
                                        <th className="px-4 py-3">Requested At</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pending.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{item.memberName}</span>
                                                    <span className="text-xs text-muted-foreground">{item.memberId}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{item.oldUid}</td>
                                            <td className="px-4 py-3">{item.newUid}</td>
                                            <td className="px-4 py-3">{item.reason}</td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="sm" className="text-primary">
                                                    Lihat Bukti
                                                </Button>
                                            </td>
                                            <td className="px-4 py-3">{item.requestedAt}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="gap-2 text-success">
                                                        <Check className="size-4" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="gap-2 text-destructive">
                                                        <X className="size-4" /> Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Request ID</th>
                                        <th className="px-4 py-3">Member</th>
                                        <th className="px-4 py-3">Old UID</th>
                                        <th className="px-4 py-3">New UID</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Decided At</th>
                                        <th className="px-4 py-3">Decided By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">{item.id}</td>
                                            <td className="px-4 py-3">{item.memberName}</td>
                                            <td className="px-4 py-3">{item.oldUid}</td>
                                            <td className="px-4 py-3">{item.newUid}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        item.status === 'approved'
                                                            ? 'bg-success/10 text-success border-success/20'
                                                            : 'bg-destructive/10 text-destructive border-destructive/20'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{item.decidedAt}</td>
                                            <td className="px-4 py-3">{item.decidedBy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
