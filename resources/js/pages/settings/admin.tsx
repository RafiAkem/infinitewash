import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { admin as adminSettingsIndex } from '@/routes/settings';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Palette, ShieldAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: adminSettingsIndex() },
];

export default function AdminSettingsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Settings" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Palette className="size-5 text-primary" />
                            <div>
                                <CardTitle>Branding & Tampilan</CardTitle>
                                <CardDescription>Pengaturan ini hanya dapat diakses oleh role dengan izin accounts.manage atau roles.manage.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
                        <div className="grid gap-6">
                            <section className="grid gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold">Branding</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="brand-name">Nama Aplikasi</Label>
                                        <Input id="brand-name" defaultValue="InfiniteWash" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="brand-tagline">Tagline</Label>
                                        <Input id="brand-tagline" defaultValue="Admin Membership System" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="brand-logo">Logo</Label>
                                        <Button id="brand-logo" variant="outline" className="gap-2 self-start">
                                            Unggah Logo
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold">Preferensi</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="theme">Theme</Label>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="w-full">
                                                Light
                                            </Button>
                                            <Button size="sm" variant="outline" className="w-full">
                                                Dark
                                            </Button>
                                            <Button size="sm" variant="outline" className="w-full">
                                                System
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Input id="timezone" defaultValue="Asia/Jakarta" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="date-format">Format Tanggal</Label>
                                        <Input id="date-format" defaultValue="DD/MM/YYYY" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="language">Bahasa</Label>
                                        <Input id="language" defaultValue="ID" />
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold">Validasi & Limit</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="upload-limit">Upload Proof Limit (MB)</Label>
                                        <Input id="upload-limit" defaultValue="5" type="number" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="phone-rule">Validasi Telepon</Label>
                                        <Input id="phone-rule" defaultValue="Indonesia (+62)" />
                                    </div>
                                </div>
                                <Button className="self-start">Simpan Perubahan</Button>
                            </section>
                        </div>
                        <aside className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-muted/20 p-6 text-sm text-muted-foreground dark:border-sidebar-border">
                            <div className="flex items-start gap-3 text-warning">
                                <ShieldAlert className="mt-1 size-5" />
                                <div>
                                    <p className="font-medium text-warning">Hak Akses Sensitif</p>
                                    <p>
                                        Hanya role dengan permission <code>accounts.manage</code> atau <code>roles.manage</code> yang dapat mengubah pengaturan ini.
                                    </p>
                                </div>
                            </div>
                            <p>
                                Setiap perubahan tersimpan di audit trail dan akan mengirimkan notifikasi ke Owner. Pastikan untuk menguji perubahan sebelum diterapkan ke tim operasional.
                            </p>
                            <Badge variant="outline" className="self-start">
                                Guard: web
                            </Badge>
                        </aside>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
