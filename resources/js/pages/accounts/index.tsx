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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { accounts as accountData, roles as roleData } from '@/lib/sample-data';
import { index as accountsIndex } from '@/routes/accounts';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronRight, Plus, Shield } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounts', href: accountsIndex() },
];

export default function AccountsPage() {
    const [open, setOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <CardTitle>Manajemen Akun</CardTitle>
                            <CardDescription>
                                Atur pengguna, role, status login, dan akses langsung sesuai permission Spatie.
                            </CardDescription>
                        </div>
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="size-4" /> Akun Baru
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full max-w-xl">
                                <SheetHeader>
                                    <SheetTitle>Buat Akun</SheetTitle>
                                    <SheetDescription>
                                        Isi data pengguna, lalu assign role. Owner dan Manager dapat melakukan aksi ini.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="mt-6 grid gap-4">
                                    <Input placeholder="Nama" />
                                    <Input placeholder="Email/Username" />
                                    <Input placeholder="Kirim reset password" type="email" />
                                    <Select defaultValue="active">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-foreground">Assign Roles</span>
                                        <div className="flex flex-wrap gap-2">
                                            {roleData.map((role) => (
                                                <Badge key={role.name} variant="outline" className="cursor-pointer">
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm text-warning-foreground">
                                        Memberikan direct permission akan menimpa preset role. Pastikan perubahan sudah disetujui Owner.
                                    </div>
                                    <Button onClick={() => setOpen(false)}>Simpan Pengguna</Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        <Input placeholder="Cari nama atau email" className="md:col-span-1" />
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                {roleData.map((role) => (
                                    <SelectItem key={role.name} value={role.name}>
                                        {role.name}
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
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-sm">
                                <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Nama</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Roles</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Last Login</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountData.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{account.name}</span>
                                                    <span className="text-xs text-muted-foreground">ID #{account.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{account.email}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {account.roles.map((role) => (
                                                        <Badge key={role} variant="outline" className="gap-1">
                                                            <Shield className="size-3" /> {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={account.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}
                                                >
                                                    {account.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{account.lastLogin}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                                    Detail <ChevronRight className="size-4" />
                                                </Button>
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
