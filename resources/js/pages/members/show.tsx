import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { members as membersData, packages } from '@/lib/sample-data';
import { index as cardReplacementIndex } from '@/routes/card-replacement';
import { index as membersIndex } from '@/routes/members';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Clock, CreditCard, IdCard, MapPin, Phone, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

type MemberStatus = 'active' | 'inactive' | 'expired';

const statusCopy: Record<MemberStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
    inactive: { label: 'Inactive', className: 'bg-warning/10 text-warning border-warning/20' },
    expired: { label: 'Expired', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const tabs = [
    { key: 'profile', label: 'Profil' },
    { key: 'vehicles', label: 'Kendaraan' },
    { key: 'membership', label: 'Membership' },
    { key: 'visits', label: 'Riwayat Kunjungan' },
];

const getDaysLeft = (expiresAt: string) => {
    const today = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
};

export default function MemberDetail() {
    const page = usePage<{ memberId: string }>();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Members', href: membersIndex() },
        { title: page.props.memberId ?? 'Detail', href: `/members/${page.props.memberId ?? ''}` },
    ];

    const member = useMemo(() => {
        return membersData.find((item) => item.id === page.props.memberId) ?? membersData[0];
    }, [page.props.memberId]);

    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const daysLeft = getDaysLeft(member.expiresAt);
    const packageInfo = packages.find((pkg) => pkg.id === member.packageId);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Member ${member.name}`} />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardContent className="flex flex-col gap-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                        {member.name}
                                    </h1>
                                    <Badge variant="outline">{member.id}</Badge>
                                    <Badge
                                        variant="outline"
                                        className={statusCopy[member.status as MemberStatus]?.className}
                                    >
                                        {statusCopy[member.status as MemberStatus]?.label}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-2">
                                        <CreditCard className="size-4" /> Paket {packageInfo?.name}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Calendar className="size-4" /> Bergabung {member.joinedAt}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Clock className="size-4" /> Berakhir {member.expiresAt}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button asChild variant="outline" className="gap-2">
                                    <Link href={cardReplacementIndex()} prefetch>
                                        <IdCard className="size-4" /> Request Penggantian Kartu
                                    </Link>
                                </Button>
                                <Button className="gap-2">
                                    <RefreshCw className="size-4" /> Perpanjang Membership
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 rounded-xl border border-sidebar-border/60 bg-muted/30 p-4 text-sm dark:border-sidebar-border lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="font-medium text-foreground">Masa berlaku</span>
                                <div className="w-48 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-primary"
                                        style={{ width: `${Math.max(10, Math.min(100, (daysLeft / 365) * 100))}%` }}
                                    />
                                </div>
                                <span className="text-muted-foreground">
                                    {daysLeft > 0
                                        ? `${daysLeft} hari tersisa`
                                        : 'Membership sudah kadaluarsa'}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Card UID:</span> {member.cardUid}
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-2">
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
                        </div>
                    </CardContent>
                </Card>

                {activeTab === 'profile' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Profil Member</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <Phone className="mt-1 size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                                    <p className="text-base font-medium">{member.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-1 size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Alamat</p>
                                    <p className="text-base font-medium leading-relaxed">{member.address}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'vehicles' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {member.vehicles.map((vehicle, index) => (
                            <Card
                                key={vehicle.plate}
                                className="border-sidebar-border/70 bg-card/60 shadow-sm transition hover:border-primary/60 dark:border-sidebar-border"
                            >
                                <CardContent className="flex flex-col gap-3 p-6">
                                    <Badge variant="outline">Kendaraan #{index + 1}</Badge>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Plat Nomor</p>
                                        <p className="text-lg font-semibold">{vehicle.plate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Warna</p>
                                        <p className="text-base font-medium">{vehicle.color}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'membership' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardContent className="grid gap-6 p-6">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                    <strong>Aktif sejak:</strong> {member.joinedAt}
                                </span>
                                <span>
                                    <strong>Berlaku hingga:</strong> {member.expiresAt}
                                </span>
                                <span>
                                    <strong>Paket:</strong> {packageInfo?.name}
                                </span>
                                <span>
                                    <strong>Kuota Kendaraan:</strong> {packageInfo?.quota}
                                </span>
                            </div>
                            <div className="rounded-lg border border-dashed border-sidebar-border/60 p-4 text-sm text-muted-foreground dark:border-sidebar-border">
                                Catatan: Paket {packageInfo?.name} memungkinkan {packageInfo?.quota} kendaraan aktif sekaligus. Gunakan tombol perpanjang untuk memperbaharui masa berlaku.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'visits' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardContent className="p-0">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Jam</th>
                                            <th className="px-4 py-3">Plat</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {member.visits.map((visit) => (
                                            <tr
                                                key={`${visit.date}-${visit.time}`}
                                                className="border-t border-sidebar-border/60 text-foreground transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">{visit.date}</td>
                                                <td className="px-4 py-3">{visit.time}</td>
                                                <td className="px-4 py-3">{visit.plate}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            visit.status === 'allowed'
                                                                ? 'bg-success/10 text-success border-success/20'
                                                                : 'bg-destructive/10 text-destructive border-destructive/20'
                                                        }
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
                )}
            </div>
        </AppLayout>
    );
}
