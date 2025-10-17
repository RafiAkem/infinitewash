import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { create as membersCreate, destroyMany as membersDestroyMany, index as membersIndex, show as membersShow } from '@/routes/members';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberListItem {
    id: string;
    member_code: string;
    name: string;
    phone: string;
    address: string;
    package: string;
    card_uid: string;
    status: string;
}

interface MembersPageProps {
    members: {
        data: MemberListItem[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search: string;
        package: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: membersIndex().url,
    },
];

const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-warning/10 text-warning border-warning/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function MembersList() {
    const { members, filters } = usePage<MembersPageProps>().props;
    const memberData = members.data;
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedPackage, setSelectedPackage] = useState(filters.package ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setSearch(filters.search ?? '');
        setSelectedPackage(filters.package ?? 'all');
        setStatus(filters.status ?? 'all');
    }, [filters.search, filters.package, filters.status]);

    useEffect(() => {
        const handler = setTimeout(() => {
            router.visit(
                membersIndex.url({
                    query: {
                        search: search || undefined,
                        package: selectedPackage !== 'all' ? selectedPackage : undefined,
                        status: status !== 'all' ? status : undefined,
                    },
                }),
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                }
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [search, selectedPackage, status]);

    useEffect(() => {
        setSelectedIds([]);
    }, [memberData]);

    const allIds = useMemo(() => memberData.map((member) => member.id), [memberData]);

    const isAllSelected = selectedIds.length > 0 && selectedIds.length === allIds.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allIds);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            return;
        }

        setIsSubmitting(true);
        router.delete(membersDestroyMany.url(), {
            preserveScroll: true,
            data: {
                ids: selectedIds,
            },
            onSuccess: () => {
                setSelectedIds([]);
                setConfirmOpen(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setConfirmOpen(false);
            },
        });
    };

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
                            <Button asChild className="gap-2">
                                <Link href={membersCreate().url} prefetch>
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
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                        </div>
                        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Paket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Paket</SelectItem>
                                <SelectItem value="299k">Basic</SelectItem>
                                <SelectItem value="499k">Plus</SelectItem>
                                <SelectItem value="669k">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
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
                            <Checkbox
                                id="select-all"
                                aria-label="Select all members"
                                checked={isAllSelected}
                                onCheckedChange={toggleSelectAll}
                                className={cn({ 'opacity-100': isIndeterminate })}
                                data-state={isIndeterminate ? 'indeterminate' : undefined}
                            />
                            <span>
                                {selectedIds.length > 0
                                    ? `${selectedIds.length} dipilih`
                                    : 'Pilih semua'}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            className="gap-2 text-sm text-muted-foreground hover:text-foreground"
                            disabled={selectedIds.length === 0}
                            onClick={() => setConfirmOpen(true)}
                        >
                            <Trash2 className="size-4" /> Bulk Delete
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
                                {memberData.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                    >
                                        <td className="px-4 py-3">
                                            <Checkbox
                                                id={`select-${member.id}`}
                                                aria-label={`Select ${member.name}`}
                                                checked={selectedIds.includes(member.id)}
                                                onCheckedChange={() => toggleSelect(member.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium">{member.member_code}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{member.name}</span>
                                                <span className="text-xs text-muted-foreground">{member.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{member.phone}</td>
                                        <td className="px-4 py-3">
                                            {member.package}
                                        </td>
                                        <td className="px-4 py-3">{member.card_uid}</td>
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
                                                <Link href={membersShow(member.id!).url} prefetch>
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
                        <span>
                            Menampilkan {members.from ?? 0}–{members.to ?? 0} dari {members.total} anggota
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {members.links.map((link, index) => {
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
                </div>
            </div>
        <Dialog
            open={confirmOpen}
            onOpenChange={(open) => {
                if (!open && isSubmitting) {
                    return;
                }
                setConfirmOpen(open);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="size-5" /> Konfirmasi Hapus
                    </DialogTitle>
                    <DialogDescription>
                        Anda akan menghapus {selectedIds.length} member. Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    Pastikan data member sudah di backup sebelum melanjutkan.
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={selectedIds.length === 0 || isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                        Hapus {selectedIds.length} Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </AppLayout>
    );
}
