import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index as accountsIndex, show as accountsShow, store as accountsStore, updatePassword as accountsUpdatePassword, destroy as accountsDestroy } from '@/routes/accounts';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronRight, Loader2, Plus, Shield, Lock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounts', href: accountsIndex().url },
];

interface AccountsPageProps {
    users: {
        id: number;
        name: string;
        username: string;
        email: string;
        roles: string[];
        status: string;
        last_login: string;
    }[];
    roles: { name: string }[];
    filters: {
        search: string;
        role: string;
        status: string;
    };
    flash?: {
        success?: string;
    };
    auth?: {
        user?: {
            id: number;
            roles?: string[];
        };
    };
    [key: string]: unknown;
}

export default function AccountsPage() {
    const { users, roles, filters, flash, auth } = usePage<AccountsPageProps>().props;
    const [showDialog, setShowDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedRole, setSelectedRole] = useState(filters.role ?? 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status ?? 'all');
    
    const isOwner = auth?.user?.roles?.includes('Owner') ?? false;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0]?.name ?? 'Cashier',
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: updatingPassword, errors: passwordErrors, reset: resetPassword } = useForm({
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setShowDialog(false);
            reset();
        }
    }, [flash?.success, reset]);

    useEffect(() => {
        const handler = setTimeout(() => {
            router.visit(
                accountsIndex.url({
                    query: {
                        search: search || undefined,
                        role: selectedRole !== 'all' ? selectedRole : undefined,
                        status: selectedStatus !== 'all' ? selectedStatus : undefined,
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
    }, [search, selectedRole, selectedStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(accountsStore().url, {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal menambahkan akun. Periksa form dan coba lagi.');
            },
        });
    };

    const handleOpenDialog = () => {
        reset();
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        reset();
    };

    const handleShowDetail = async (userId: number) => {
        setLoadingDetail(true);
        setShowDetailDialog(true);
        setSelectedUser(null);
        
        try {
            const response = await fetch(accountsShow(userId).url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const userData = await response.json();
                setSelectedUser(userData);
            } else {
                toast.error('Gagal memuat detail akun.');
                setShowDetailDialog(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat memuat detail akun.');
            setShowDetailDialog(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetailDialog = () => {
        setShowDetailDialog(false);
        setSelectedUser(null);
    };

    const handleOpenPasswordDialog = () => {
        resetPassword();
        setShowPasswordDialog(true);
    };

    const handleClosePasswordDialog = () => {
        setShowPasswordDialog(false);
        resetPassword();
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        putPassword(accountsUpdatePassword(selectedUser.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password berhasil diubah.');
                setShowPasswordDialog(false);
                resetPassword();
            },
            onError: () => {
                toast.error('Gagal mengubah password. Periksa form dan coba lagi.');
            },
        });
    };

    const handleOpenDeleteDialog = () => {
        setShowDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
    };

    const handleDeleteAccount = () => {
        if (!selectedUser) return;

        router.delete(accountsDestroy(selectedUser.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Akun berhasil dihapus.');
                setShowDeleteDialog(false);
                setShowDetailDialog(false);
                setSelectedUser(null);
            },
            onError: (errors) => {
                const errorMessage = errors.user || 'Gagal menghapus akun.';
                toast.error(errorMessage);
                setShowDeleteDialog(false);
            },
        });
    };

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
                        <Button className="gap-2" onClick={handleOpenDialog}>
                            <Plus className="size-4" /> Akun Baru
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        <Input
                            placeholder="Cari nama atau email"
                            className="md:col-span-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.name} value={role.name}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                Tidak ada akun ditemukan
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.roles.length === 0 ? (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        ) : (
                                                            user.roles.map((role) => (
                                                                <Badge key={role} variant="outline" className="gap-1">
                                                                    <Shield className="size-3" /> {role}
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            user.status === 'Active'
                                                                ? 'bg-success/10 text-success border-success/20'
                                                                : 'bg-warning/10 text-warning border-warning/20'
                                                        }
                                                    >
                                                        {user.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">{user.last_login}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="gap-1 text-primary"
                                                        onClick={() => handleShowDetail(user.id)}
                                                    >
                                                        Detail <ChevronRight className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={showDialog} onOpenChange={(open) => {
                    if (!open) {
                        handleCloseDialog();
                    }
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Buat Akun Baru</DialogTitle>
                            <DialogDescription>
                                Isi data pengguna, lalu assign role. Owner dapat melakukan aksi ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: John Doe"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Contoh: johndoe"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                    />
                                    <InputError message={errors.username} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="johndoe@example.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.name} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Pengguna'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={showDetailDialog} onOpenChange={(open) => {
                    if (!open) {
                        handleCloseDetailDialog();
                    }
                }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detail Akun</DialogTitle>
                            <DialogDescription>
                                Informasi lengkap tentang akun pengguna
                            </DialogDescription>
                        </DialogHeader>
                        {loadingDetail ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : selectedUser ? (
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Nama Lengkap</span>
                                        <span className="text-base font-medium">{selectedUser.name}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Username</span>
                                        <span className="text-base font-medium">@{selectedUser.username}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                                        <span className="text-base font-medium">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                selectedUser.status === 'Active'
                                                    ? 'bg-success/10 text-success border-success/20 w-fit'
                                                    : 'bg-warning/10 text-warning border-warning/20 w-fit'
                                            }
                                        >
                                            {selectedUser.status}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Bergabung</span>
                                        <span className="text-base font-medium">{selectedUser.created_at}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Email Terverifikasi</span>
                                        <span className="text-base font-medium">{selectedUser.email_verified_at || '—'}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <span className="text-sm font-medium text-muted-foreground">Last Login</span>
                                        <span className="text-base font-medium">{selectedUser.last_login}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Roles</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.roles.length === 0 ? (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        ) : (
                                            selectedUser.roles.map((role: string) => (
                                                <Badge key={role} variant="outline" className="gap-1">
                                                    <Shield className="size-3" /> {role}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Permissions</span>
                                    <div className="rounded-lg border border-sidebar-border/60 bg-muted/30 p-3 max-h-48 overflow-y-auto dark:border-sidebar-border">
                                        {selectedUser.permissions.length === 0 ? (
                                            <span className="text-sm text-muted-foreground">Tidak ada permission khusus</span>
                                        ) : (
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {selectedUser.permissions.map((permission: string) => (
                                                    <span key={permission} className="text-xs font-mono text-muted-foreground">
                                                        {permission}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <div className="flex flex-1 gap-2">
                                {isOwner && selectedUser && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleOpenPasswordDialog}
                                            className="gap-2"
                                        >
                                            <Lock className="size-4" /> Ganti Password
                                        </Button>
                                        {!selectedUser.roles?.includes('Owner') && (
                                            <Button
                                                variant="destructive"
                                                onClick={handleOpenDeleteDialog}
                                                className="gap-2"
                                            >
                                                <Trash2 className="size-4" /> Hapus Akun
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                            <Button variant="outline" onClick={handleCloseDetailDialog}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showPasswordDialog} onOpenChange={(open) => {
                    if (!open) {
                        handleClosePasswordDialog();
                    }
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Ganti Password</DialogTitle>
                            <DialogDescription>
                                Masukkan password baru untuk akun {selectedUser?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdatePassword}>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                    />
                                    <InputError message={passwordErrors.password} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={passwordErrors.password_confirmation} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClosePasswordDialog}
                                    disabled={updatingPassword}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={updatingPassword}>
                                    {updatingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Password'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={showDeleteDialog} onOpenChange={(open: boolean) => {
                    if (!open) {
                        handleCloseDeleteDialog();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                Konfirmasi Hapus Akun
                            </DialogTitle>
                            <DialogDescription>
                                Anda akan menghapus akun <strong>{selectedUser?.name}</strong>. Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            Pastikan data akun sudah di backup sebelum melanjutkan.
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDeleteDialog}>
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                className="gap-2"
                            >
                                <Trash2 className="size-4" /> Hapus Akun
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
