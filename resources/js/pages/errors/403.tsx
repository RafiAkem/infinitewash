import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, Lock } from 'lucide-react';

export default function Forbidden() {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="403 - Akses Ditolak" />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <Card className="w-full max-w-md border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
                            <Lock className="size-8 text-destructive" />
                        </div>
                        <CardTitle className="text-3xl font-bold">403</CardTitle>
                        <CardDescription className="text-base">
                            Akses Ditolak
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
                            Jika Anda yakin ini adalah kesalahan, hubungi administrator.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <Button variant="outline" className="gap-2" asChild>
                                <Link href="/dashboard">
                                    <ArrowLeft className="size-4" />
                                    Kembali ke Dashboard
                                </Link>
                            </Button>
                            <Button variant="default" className="gap-2" asChild>
                                <Link href="/dashboard">
                                    <Home className="size-4" />
                                    Beranda
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

