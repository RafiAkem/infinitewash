import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import {
    members as membersData,
    packages as packageOptions,
} from '@/lib/sample-data';
import { membersCreate, membersShow } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Download, Filter, Plus, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: '/members',
    },
];

const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-warning/10 text-warning border-warning/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function MembersList() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                                Data Anggota
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola keanggotaan, status kartu, dan kuota kendaraan dengan cepat.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" className="gap-2">
                                <Download className="size-4" /> Export CSV
                            </Button>
                            <Button asChild className="gap-2">
                                <Link href={membersCreate()} prefetch>
                                    <Plus className="size-4" /> Tambah Member
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama, nomor telepon, atau kode member"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Paket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Paket</SelectItem>
                                {packageOptions.map((pkg) => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                        {pkg.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Nonaktif</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <div className="flex items-center justify-between gap-3 border-b border-sidebar-border/60 px-4 py-3 text-sm dark:border-sidebar-border">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Checkbox id="select-all" aria-label="Select all members" />
                            <span>Pilih semua</span>
                        </div>
                        <Button variant="ghost" className="gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <Filter className="size-4" /> Bulk Delete
                        </Button>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                                <tr className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    <th className="px-4 py-3">
                                        <span className="sr-only">Select</span>
                                    </th>
                                    <th className="px-4 py-3">Member Code</th>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Telepon</th>
                                    <th className="px-4 py-3">Paket</th>
                                    <th className="px-4 py-3">Card UID</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-foreground">
                                {membersData.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                    >
                                        <td className="px-4 py-3">
                                            <Checkbox id={`select-${member.id}`} aria-label={`Select ${member.name}`} />
                                        </td>
                                        <td className="px-4 py-3 font-medium">{member.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{member.name}</span>
                                                <span className="text-xs text-muted-foreground">{member.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{member.phone}</td>
                                        <td className="px-4 py-3">
                                            {packageOptions.find((pkg) => pkg.id === member.packageId)?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3">{member.cardUid}</td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className={statusColors[member.status] ?? ''}
                                            >
                                                {member.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button asChild size="sm" variant="outline" className="gap-2">
                                                <Link href={membersShow(member.id)} prefetch>
                                                    Detail
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col items-center gap-2 border-t border-sidebar-border/60 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:justify-between dark:border-sidebar-border">
                        <span>Menampilkan 1–{membersData.length} dari {membersData.length} anggota</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                Sebelumnya
                            </Button>
                            <Button size="sm">Selanjutnya</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
