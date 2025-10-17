import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { index as membersIndex, store as membersStore } from '@/routes/members';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CreditCard, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

const steps = [
    {
        key: 'profile',
        title: 'Informasi Member',
        description: 'Nama lengkap, nomor telepon, dan alamat member baru.',
        icon: UserRound,
    },
    {
        key: 'package',
        title: 'Paket & Kendaraan',
        description: 'Pilih paket dan masukkan data kendaraan sesuai kuota.',
        icon: CreditCard,
    },
    {
        key: 'card',
        title: 'Kartu & Review',
        description: 'Scan UID kartu dan pastikan ringkasan data sudah benar.',
        icon: CheckCircle2,
    },
];

interface PackageOption {
    id: string;
    name: string;
    price: number;
    quota: number;
}

interface CreateMemberPageProps {
    packages: PackageOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Members', href: membersIndex().url },
    { title: 'New Member', href: '/members/create' },
];

export default function NewMemberWizard({ packages }: CreateMemberPageProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const { data, setData, post, processing } = useForm({
        name: '',
        phone: '',
        address: '',
        card_uid: '',
        package: packages[0]?.id ?? '299k',
        vehicles: [{ plate: '', color: '' }],
        membership: {
            valid_from: new Date().toISOString().slice(0, 10),
            valid_to: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
        },
    });

    const quota = useMemo(() => {
        const pkg = packages.find((item) => item.id === data.package);
        return pkg?.quota ?? 1;
    }, [packages, data.package]);

    const updateVehicle = (index: number, key: 'plate' | 'color', value: string) => {
        const vehicles = [...data.vehicles];
        if (!vehicles[index]) {
            vehicles[index] = { plate: '', color: '' };
        }
        vehicles[index] = { ...vehicles[index], [key]: value };
        setData('vehicles', vehicles);
    };

    const handleSubmit = () => {
        post(membersStore().url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Member" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
                                Onboarding Member Baru
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Lengkapi data member dalam 3 langkah singkat. Semua field wajib diisi.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={membersIndex().url} prefetch>
                                <ArrowLeft className="size-4" /> Kembali ke daftar
                            </Link>
                        </Button>
                    </div>
                    <ol className="grid gap-3 md:grid-cols-3">
                        {steps.map((step, index) => {
                            const isCompleted = index < currentStep;
                            const isActive = index === currentStep;
                            return (
                                <li
                                    key={step.key}
                                    className={`flex flex-col gap-1 rounded-lg border p-3 transition ${
                                        isActive
                                            ? 'border-primary bg-primary/5'
                                            : isCompleted
                                                ? 'border-success bg-success/10'
                                                : 'border-sidebar-border/70 bg-muted/20 dark:border-sidebar-border'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <step.icon
                                            className={`size-4 ${
                                                isActive
                                                    ? 'text-primary'
                                                    : isCompleted
                                                        ? 'text-success'
                                                        : 'text-muted-foreground'
                                            }`}
                                        />
                                        <span>
                                            Langkah {index + 1}: {step.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="flex flex-col gap-6">
                        {currentStep === 0 && (
                            <section className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                                <div>
                                    <h2 className="text-lg font-semibold">Data Member</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Gunakan format nomor telepon Indonesia (+62) dan alamat lengkap.
                                    </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            placeholder="Contoh: Agus Pratama"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <Input
                                            id="phone"
                                            placeholder="+62 812-xxxx-xxxx"
                                            value={data.phone}
                                            onChange={(event) => setData('phone', event.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <Label htmlFor="address">Alamat</Label>
                                        <Input
                                            id="address"
                                            placeholder="Tuliskan alamat lengkap"
                                            value={data.address}
                                            onChange={(event) => setData('address', event.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 1 && (
                            <section className="flex flex-col gap-6 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                                <div>
                                    <h2 className="text-lg font-semibold">Paket & Kuota Kendaraan</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Kuota kendaraan akan disesuaikan otomatis. Isi data plat dan warna.
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="flex flex-col gap-2 sm:col-span-2">
                                        <Label>Paket Membership</Label>
                                        <Select
                                            value={data.package}
                                            onValueChange={(value) => setData('package', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {packages.map((pkg) => (
                                                    <SelectItem value={pkg.id} key={pkg.id}>
                                                        {pkg.name} • Rp {pkg.price.toLocaleString('id-ID')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Kuota Kendaraan</Label>
                                            <Input value={quota} readOnly />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {Array.from({ length: quota }).map((_, index) => (
                                        <div key={index} className="grid gap-3 rounded-lg border border-dashed border-sidebar-border/60 p-4 transition hover:border-primary dark:border-sidebar-border">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    Kendaraan #{index + 1}
                                                </span>
                                                <Badge variant="outline">Opsional</Badge>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`plate-${index}`}>No. Polisi</Label>
                                                    <Input
                                                        id={`plate-${index}`}
                                                        placeholder="D 1234 ABC"
                                                        value={data.vehicles[index]?.plate ?? ''}
                                                        onChange={(event) => updateVehicle(index, 'plate', event.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`color-${index}`}>Warna</Label>
                                                    <Input
                                                        id={`color-${index}`}
                                                        placeholder="Hitam"
                                                        value={data.vehicles[index]?.color ?? ''}
                                                        onChange={(event) => updateVehicle(index, 'color', event.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {currentStep === 2 && (
                            <section className="flex flex-col gap-6 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                                <div>
                                    <h2 className="text-lg font-semibold">Kartu & Ringkasan</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Pindai kartu RFID baru dan pastikan semua data sudah sesuai sebelum menyimpan.
                                    </p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="card-uid">Card UID</Label>
                                        <Input
                                            id="card-uid"
                                            placeholder="Scan atau input manual"
                                            value={data.card_uid}
                                            onChange={(event) => setData('card_uid', event.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="valid-from">Aktif Mulai</Label>
                                        <Input
                                            id="valid-from"
                                            type="date"
                                            value={data.membership.valid_from}
                                            onChange={(event) =>
                                                setData('membership', {
                                                    ...data.membership,
                                                    valid_from: event.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="valid-to">Aktif Sampai</Label>
                                        <Input
                                            id="valid-to"
                                            type="date"
                                            value={data.membership.valid_to}
                                            onChange={(event) =>
                                                setData('membership', {
                                                    ...data.membership,
                                                    valid_to: event.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="rounded-lg border border-sidebar-border/60 bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground dark:border-sidebar-border">
                                    <p className="font-medium text-foreground">Ringkasan Data</p>
                                    <ul className="mt-2 grid gap-1">
                                        <li>• Paket: {packages.find((pkg) => pkg.id === data.package)?.name}</li>
                                        <li>• Kuota Kendaraan: {quota}</li>
                                        <li>• Status awal: Aktif</li>
                                    </ul>
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="flex h-fit flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                        <h2 className="text-base font-semibold">Catatan Penting</h2>
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li>• Pastikan nomor telepon unik dan valid.</li>
                            <li>• UID kartu harus belum pernah digunakan sebelumnya.</li>
                            <li>• Kuota kendaraan mengikuti paket dan dapat diperbarui setelah membuat akun.</li>
                            <li>• Pengguna dengan role Manager & Owner dapat memproses onboarding.</li>
                        </ul>
                        <div className="mt-2 flex flex-col gap-3 border-t border-sidebar-border/60 pt-4 text-sm dark:border-sidebar-border">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Langkah</span>
                                <span>
                                    {currentStep + 1} / {steps.length}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled={currentStep === 0}
                                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                                >
                                    Sebelumnya
                                </Button>
                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
                                        }
                                    >
                                        Lanjut
                                    </Button>
                                ) : (
                                    <Button className="w-full" onClick={handleSubmit} disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Buat Member'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
