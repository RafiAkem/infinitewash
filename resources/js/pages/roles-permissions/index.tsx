import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { index as rolesPermissionsIndex } from '@/routes/roles-permissions';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    Crown,
    FileText,
    IdCard,
    Loader2,
    RefreshCw,
    Scan,
    Search,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengaturan Hak Akses Role', href: rolesPermissionsIndex() },
];

interface Permission {
    name: string;
    label: string;
    icon: string;
}

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface RolesPermissionsPageProps {
    roles: Role[];
    permissions: Permission[];
    flash?: {
        success?: string;
    };
}

const iconMap: Record<string, any> = {
    Users,
    CreditCard,
    Scan,
    Search,
    BarChart3,
    UserCog,
    ShieldCheck,
    IdCard,
    CloudUpload: RefreshCw,
    Circle: FileText,
};

export default function RolesPermissionsPage() {
    const { roles, permissions, flash } = usePage<RolesPermissionsPageProps>().props;

    const ownerRole = roles.find((r) => r.name === 'Owner')!;
    const cashierRole = roles.find((r) => r.name === 'Cashier')!;

    const [cashierPermissions, setCashierPermissions] = useState<string[]>(cashierRole.permissions);
    const [isSaving, setIsSaving] = useState(false);

    const hasChanges = useMemo(() => {
        const sortedCurrent = [...cashierPermissions].sort();
        const sortedOriginal = [...cashierRole.permissions].sort();
        return JSON.stringify(sortedCurrent) !== JSON.stringify(sortedOriginal);
    }, [cashierPermissions, cashierRole.permissions]);

    const handleTogglePermission = (permissionName: string) => {
        setCashierPermissions((prev) =>
            prev.includes(permissionName)
                ? prev.filter((p) => p !== permissionName)
                : [...prev, permissionName]
        );
    };

    const handleApply = () => {
        setIsSaving(true);
        router.put(
            '/roles-permissions',
            {
                role: 'Cashier',
                permissions: cashierPermissions,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSaving(false);
                },
                onSuccess: () => {
                    // Refresh page data after update
                    window.location.reload();
                },
            }
        );
    };

    const handleReset = () => {
        if (confirm('Yakin ingin reset permissions Cashier ke default?')) {
            setIsSaving(true);
            router.post(
                '/roles-permissions/reset',
                {},
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setIsSaving(false);
                    },
                    onSuccess: () => {
                        // Reload page data after reset
                        window.location.reload();
                    },
                }
            );
        }
    };

    const getIcon = (iconName: string) => {
        const IconComponent = iconMap[iconName] || FileText;
        return <IconComponent className="size-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Hak Akses Role" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {flash?.success && (
                    <div className="rounded-lg border border-success/60 bg-success/10 p-4 text-success">
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}

                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Pengaturan Hak Akses Role</CardTitle>
                        <CardDescription>
                            Owner memiliki semua akses penuh. Atur permissions untuk Cashier di bawah ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Owner Column */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                                    <div className="rounded-full bg-purple-500/20 p-2">
                                        <Crown className="size-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">OWNER</h3>
                                        <p className="text-sm text-muted-foreground">Akses penuh</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {permissions.map((permission) => (
                                        <div
                                            key={permission.name}
                                            className="flex items-center gap-3 rounded-lg border border-sidebar-border/60 bg-card p-3 dark:border-sidebar-border"
                                        >
                                            <div className="text-muted-foreground">
                                                {getIcon(permission.icon)}
                                            </div>
                                            <span className="flex-1 text-sm text-foreground">
                                                {permission.label}
                                            </span>
                                            <div className="flex size-5 items-center justify-center rounded border-2 border-purple-600 bg-purple-600">
                                                <svg
                                                    className="size-3 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={3}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cashier Column */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                                    <div className="rounded-full bg-orange-500/20 p-2">
                                        <Users className="size-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">CASHIER</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {cashierPermissions.length} permissions aktif
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {permissions.map((permission) => {
                                        const isChecked = cashierPermissions.includes(permission.name);
                                        return (
                                            <label
                                                key={permission.name}
                                                className="flex cursor-pointer items-center gap-3 rounded-lg border border-sidebar-border/60 bg-card p-3 transition hover:border-primary/60 dark:border-sidebar-border"
                                            >
                                                <div className="text-muted-foreground">
                                                    {getIcon(permission.icon)}
                                                </div>
                                                <span className="flex-1 text-sm text-foreground">
                                                    {permission.label}
                                                </span>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() =>
                                                        handleTogglePermission(permission.name)
                                                    }
                                                    disabled={isSaving}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-sidebar-border/60 pt-6 dark:border-sidebar-border">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={isSaving}
                                className="gap-2"
                            >
                                <RefreshCw className="size-4" />
                                Reset ke Default
                            </Button>
                            <Button
                                onClick={handleApply}
                                disabled={!hasChanges || isSaving}
                                className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="size-4" />
                                        Terapkan Perubahan
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
