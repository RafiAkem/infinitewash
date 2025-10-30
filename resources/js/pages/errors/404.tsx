import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

export default function NotFound() {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="404 - Halaman Tidak Ditemukan" />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <Card className="w-full max-w-md border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted dark:bg-muted/20">
                            <SearchX className="size-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-3xl font-bold">404</CardTitle>
                        <CardDescription className="text-base">
                            Halaman Tidak Ditemukan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Halaman yang Anda cari tidak ditemukan. 
                            Mungkin URL-nya salah atau halaman sudah dipindahkan.
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

