import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { auditLog, permissions as permissionsData, roles as rolesData } from '@/lib/sample-data';
import { rolesPermissionsIndex } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Fragment, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles & Permissions', href: rolesPermissionsIndex() },
];

const tabs = [
    { key: 'roles', label: 'Roles' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'audit', label: 'Audit' },
];

const groupPermissions = () => {
    const groups: Record<string, string[]> = {};
    permissionsData.forEach((permission) => {
        const [domain] = permission.name.split('.');
        if (!groups[domain]) {
            groups[domain] = [];
        }
        groups[domain].push(permission.name);
    });
    return groups;
};

export default function RolesPermissionsPage() {
    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const permissionGroups = useMemo(groupPermissions, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <CardTitle>Matrix Spatie Permissions</CardTitle>
                            <CardDescription>
                                Tidak ada pewarisan role. Semua izin perlu disinkronisasi eksplisit menggunakan pola sync().
                            </CardDescription>
                        </div>
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
                    </CardHeader>
                </Card>

                {activeTab === 'roles' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>Grant/Revoke dengan guard web.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
                            <div className="flex flex-col gap-4">
                                {rolesData.map((role) => (
                                    <Card
                                        key={role.name}
                                        className="border-sidebar-border/70 bg-card shadow-sm transition hover:border-primary/60 dark:border-sidebar-border"
                                    >
                                        <CardContent className="flex flex-col gap-3 p-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant="outline">guard: {role.guardName}</Badge>
                                                    <Badge variant="outline">{role.usersCount} users</Badge>
                                                </div>
                                                <span className="text-lg font-semibold text-foreground">{role.name}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                {role.permissions.slice(0, 6).map((perm) => (
                                                    <Badge key={perm} variant="outline">
                                                        {perm}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 6 && <Badge variant="outline">+{role.permissions.length - 6} lagi</Badge>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm">Grant all</Button>
                                                <Button size="sm" variant="outline">
                                                    Reset preset
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-destructive">
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <div className="rounded-xl border border-sidebar-border/70 bg-muted/20 p-6 shadow-sm dark:border-sidebar-border">
                                <h3 className="text-base font-semibold">Assign Permission per Domain</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Centang untuk grant; kosongkan untuk revoke. Gunakan tombol Apply untuk sync ke role terpilih.
                                </p>
                                <div className="mt-4 grid gap-4">
                                    {Object.entries(permissionGroups).map(([group, items]) => (
                                        <div key={group} className="rounded-lg border border-sidebar-border/60 bg-card/80 p-4 dark:border-sidebar-border">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                    {group}
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        Grant all
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        Revoke all
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid gap-3">
                                                {items.map((permission) => (
                                                    <label key={permission} className="flex items-center justify-between gap-3 rounded-md border border-sidebar-border/60 bg-muted/30 p-3 text-sm transition hover:border-primary/60 dark:border-sidebar-border">
                                                        <span>{permission}</span>
                                                        <Checkbox defaultChecked={permission.includes('view')} />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button variant="outline">Reset</Button>
                                    <Button>Apply</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'permissions' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>Kelola slug permission dan assign ke beberapa role sekaligus.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {permissionsData.map((permission) => (
                                <Fragment key={permission.name}>
                                    <div className="grid gap-3 rounded-lg border border-sidebar-border/70 bg-card/70 p-4 text-sm dark:border-sidebar-border">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{permission.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    guard: {permission.guardName}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {permission.roles.map((role) => (
                                                    <Badge key={role} variant="outline">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {rolesData.map((role) => (
                                                <Badge key={role.name} variant="outline" className="cursor-pointer">
                                                    Assign to {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </Fragment>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'audit' && (
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Audit Log</CardTitle>
                            <CardDescription>Riwayat perubahan role & permission (read only).</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {auditLog.map((entry) => (
                                <div key={entry.id} className="rounded-lg border border-sidebar-border/60 bg-muted/20 p-4 text-sm text-muted-foreground dark:border-sidebar-border">
                                    {entry.message}
                                </div>
                            ))}
                            <Button variant="outline" className="self-start">
                                Export Log
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
