import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { index as scanIndex, store as scanStore, lookup as scanLookup } from '@/routes/scan';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, History, Phone, RefreshCcw, ScanLine, Search, XCircle } from 'lucide-react';

type ScanResult = {
    status: 'allowed' | 'blocked';
    member?: {
        id: string;
        name: string;
        package: string;
        status: string;
        phone?: string;
        vehicle?: string | null;
    };
    reason?: string;
};

type TodayVisit = {
    id: number;
    time: string;
    member: {
        id: string;
        name: string;
        package?: string;
        status?: string;
        phone?: string;
    };
    plate?: string | null;
    status: 'allowed' | 'blocked';
};

type ScanPageProps = {
    todayVisits: TodayVisit[];
    lastScan?: {
        status: 'allowed' | 'blocked';
        time: string;
        plate?: string | null;
        member: {
            id: string;
            name: string;
            package: string;
            status: string;
            phone?: string;
        };
    };
    flash: {
        scan?: {
            result?: ScanResult;
        };
    };
    [key: string]: unknown;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Scan', href: scanIndex().url }];

export default function ScanPage() {
    type ScanPayload = {
        card_uid: string;
        member_id: string | null;
        via: 'card' | 'phone';
    };

    const { todayVisits, lastScan: lastScanProp, flash } = usePage<ScanPageProps>().props;
    const currentVisits = todayVisits ?? [];
    const flashResult = flash?.scan?.result ?? null;
    const { data, setData, post, processing, reset } = useForm<ScanPayload>({
        card_uid: '',
        member_id: null,
        via: 'card',
    });

    const [phoneInput, setPhoneInput] = useState('');
    const [phoneMember, setPhoneMember] = useState<{ id: string; member: ScanResult['member'] } | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [inlineResult, setInlineResult] = useState<ScanResult | null>(null);
    const displayResult = inlineResult ?? flashResult ?? null;

    const normalizePhoneInput = (value: string): string => {
        const digits = value.replace(/\D+/g, '');

        if (!digits) {
            return '';
        }

        if (digits.startsWith('62')) {
            return `0${digits.slice(2)}`;
        }

        if (!digits.startsWith('0')) {
            return `0${digits}`;
        }

        return digits;
    };

    const lastScan = useMemo(() => {
        if (flashResult) {
            return flashResult;
        }

        if (lastScanProp) {
            return {
                status: lastScanProp.status,
                member: {
                    id: lastScanProp.member.id,
                    name: lastScanProp.member.name,
                    package: lastScanProp.member.package ?? '',
                    status: lastScanProp.member.status ?? '',
                    phone: lastScanProp.member.phone,
                    vehicle: lastScanProp.plate,
                },
            } satisfies ScanResult;
        }

        return null;
    }, [flashResult, lastScanProp]);

    useEffect(() => {
        if (data.via === 'card' && data.card_uid.length === 9 && !processing) {
            submitScan();
        }
    }, [data.card_uid, data.via, processing]);

    useEffect(() => {
        if (flashResult) {
            setInlineResult(flashResult);
        }
    }, [flashResult]);

    const submitScan = () => {
        setInlineResult(null);

        post(scanStore().url, {
            preserveScroll: false,
            onSuccess: () => {
                reset();
                setPhoneMember(null);
                setPhoneInput('');
                setPhoneError(null);
            },
            onFinish: () => {
                setConfirming(false);
                setData('via', 'card');
            },
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitScan();
    };

    const handleCardInputChange = (value: string) => {
        const digitsOnly = value.replace(/\D+/g, '').slice(0, 9);
        setData('card_uid', digitsOnly);
        setData('member_id', null);
        setData('via', 'card');
        if (phoneMember) {
            setPhoneMember(null);
            setConfirming(false);
        }
        if (phoneError) {
            setPhoneError(null);
        }
    };

    const handlePhoneLookup = async () => {
        setPhoneError(null);
        setPhoneMember(null);
        setConfirming(false);
        const normalizedPhone = normalizePhoneInput(phoneInput);

        if (!normalizedPhone) {
            setPhoneError('Nomor telepon wajib diisi.');
            return;
        }

        setPhoneLoading(true);
        try {
            const response = await fetch(scanLookup().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ phone: normalizedPhone }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                setPhoneError(payload?.message ?? 'Member tidak ditemukan.');
                return;
            }

            const payload = (await response.json()) as { id: string; member: ScanResult['member'] };
            setPhoneMember(payload);
            setPhoneInput(normalizedPhone);
        } catch (error) {
            console.error(error);
            setPhoneError('Terjadi kesalahan saat mencari member.');
        } finally {
            setPhoneLoading(false);
        }
    };

    const handleConfirmScan = () => {
        if (!phoneMember) {
            return;
        }

        setConfirming(true);
        setInlineResult(null);
        
        router.post(
            scanStore().url,
            {
                card_uid: '',
                member_id: phoneMember.id,
                via: 'phone',
            },
            {
                preserveScroll: false,
                onSuccess: () => {
                    reset();
                    setPhoneMember(null);
                    setPhoneInput('');
                    setPhoneError(null);
                },
                onFinish: () => {
                    setConfirming(false);
                    setData('via', 'card');
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Scan" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Card className="border-sidebar-border/70 bg-card/60 shadow-lg dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Scan Kartu Membership</CardTitle>
                        <CardDescription>
                            Fokuskan input, tempelkan kartu RFID, dan tekan enter. Sistem akan menampilkan hasil scan secara real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6">
                                <label htmlFor="scan-input" className="text-xs font-medium uppercase tracking-wide text-primary">
                                    Card UID
                                </label>
                                <div className="relative">
                                    <ScanLine className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-primary" />
                                    <Input
                                        id="scan-input"
                                        name="card_uid"
                                        value={data.card_uid}
                                        onChange={(event) => handleCardInputChange(event.target.value)}
                                        className="h-16 text-center text-3xl tracking-[0.3em]"
                                        placeholder="Masukkan 9 digit"
                                        disabled={processing}
                                        inputMode="numeric"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span>Tempelkan kartu RFID lalu ketik 9 digit.</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-primary"
                                        onClick={() => {
                                            reset();
                                            setPhoneMember(null);
                                            setPhoneInput('');
                                            setPhoneError(null);
                                            setInlineResult(null);
                                        }}
                                        disabled={processing}
                                    >
                                        <RefreshCcw className="size-4" /> Reset Input
                                    </Button>
                                </div>
                                <Button type="submit" className="hidden" disabled={processing}>
                                    Submit
                                </Button>
                            </form>

                            <div className="flex flex-col gap-3 rounded-xl border border-sidebar-border/60 bg-card/80 p-6 text-sm shadow-sm dark:border-sidebar-border">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <Phone className="size-4" /> Cari berdasarkan nomor telepon
                                </div>
                                <div className="flex flex-col gap-2 md:flex-row">
                                    <div className="relative flex-1">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={phoneInput}
                                            onChange={(event) => setPhoneInput(event.target.value)}
                                            className="pl-9"
                                            placeholder="Contoh: 0812-xxxx-xxxx"
                                            disabled={phoneLoading || processing}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={handlePhoneLookup}
                                        disabled={phoneLoading || processing}
                                    >
                                        <Search className="size-4" /> {phoneLoading ? 'Mencari...' : 'Cari Member'}
                                    </Button>
                                </div>
                                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
                                {phoneMember && (
                                    <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
                                        <p className="text-sm font-semibold text-foreground">{phoneMember.member?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Paket: {phoneMember.member?.package ?? '-'} • Status: {phoneMember.member?.status ?? '-'}
                                        </p>
                                        {phoneMember.member?.phone && (
                                            <p className="text-xs text-muted-foreground">Telp: {phoneMember.member.phone}</p>
                                        )}
                                        {phoneMember.member?.vehicle && (
                                            <p className="text-xs text-muted-foreground">Kendaraan: {phoneMember.member.vehicle}</p>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="gap-2"
                                                onClick={handleConfirmScan}
                                                disabled={processing || confirming}
                                            >
                                                <CheckCircle2 className="size-4" /> {confirming ? 'Memproses...' : 'Konfirmasi Scan'}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setPhoneMember(null);
                                                    setPhoneError(null);
                                                }}
                                            >
                                                Batalkan
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {displayResult && (
                                    <div
                                        className={`rounded-lg border p-4 text-sm transition ${
                                            displayResult.status === 'allowed'
                                                ? 'border-success/40 bg-success/10 text-success'
                                                : 'border-destructive/40 bg-destructive/10 text-destructive'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {displayResult.status === 'allowed' ? (
                                                <CheckCircle2 className="mt-0.5 size-4" />
                                            ) : (
                                                <XCircle className="mt-0.5 size-4" />
                                            )}
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {displayResult.status === 'allowed' ? 'Scan Berhasil' : 'Scan Diblokir'}
                                                </p>
                                                <p className="text-sm text-foreground">
                                                    {displayResult.member?.name ?? 'Hasil scan belum tersedia.'}
                                                </p>
                                                {displayResult.member?.phone && (
                                                    <p className="text-xs text-muted-foreground">Telp: {displayResult.member.phone}</p>
                                                )}
                                                {displayResult.member?.vehicle && (
                                                    <p className="text-xs text-muted-foreground">Kendaraan: {displayResult.member.vehicle}</p>
                                                )}
                                                {displayResult.member?.package && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Paket: {displayResult.member.package} • Status: {displayResult.member.status}
                                                    </p>
                                                )}
                                                {displayResult.status === 'blocked' && displayResult.reason && (
                                                    <p className="text-xs text-muted-foreground">Alasan: {displayResult.reason}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Riwayat Scan Hari Ini</CardTitle>
                            <CardDescription>Catatan realtime untuk audit dan verifikasi kunjungan.</CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-2">
                            <History className="size-4" /> Total {currentVisits.length}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Jam</th>
                                        <th className="px-4 py-3">Member</th>
                                        <th className="px-4 py-3">Plat</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lastScanProp && (
                                        <tr className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border">
                                            <td className="px-4 py-3">{lastScanProp.time}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{lastScanProp.member?.name ?? '-'}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {lastScanProp.status === 'allowed' ? 'Lolos' : 'Gagal'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{lastScanProp.plate ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        lastScanProp.status === 'blocked'
                                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                            : 'bg-success/10 text-success border-success/20'
                                                    }
                                                >
                                                    {lastScanProp.status === 'allowed' ? 'Allowed' : 'Blocked'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )}
                                    {currentVisits.map((row: TodayVisit) => (
                                        <tr
                                            key={row.id}
                                            className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                        >
                                            <td className="px-4 py-3">{row.time}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{row.member.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {row.status === 'allowed' ? 'Lolos' : 'Gagal'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{row.plate ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        row.status === 'blocked'
                                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                            : 'bg-success/10 text-success border-success/20'
                                                    }
                                                >
                                                    {row.status === 'allowed' ? 'Allowed' : 'Blocked'}
                                                </Badge>
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
