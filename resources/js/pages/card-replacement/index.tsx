import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { 
    index as cardReplacementIndex,
    searchMember as cardReplacementSearchMember,
    store as cardReplacementStore,
    approve as cardReplacementApprove,
    reject as cardReplacementReject,
    proof as cardReplacementProof,
} from '@/routes/card-replacement';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, Upload, UserRoundSearch, X, Loader2, Eye, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Card Replacement', href: cardReplacementIndex().url },
];

const tabs = [
    { key: 'pending', label: 'Menunggu Persetujuan' },
    { key: 'history', label: 'Riwayat' },
];

interface PendingRequest {
    id: number;
    memberId: string;
    memberName: string;
    oldUid: string;
    newUid: string;
    reason: string;
    reasonNote?: string;
    proofPath?: string;
    requestedAt: string;
}

interface HistoryRequest {
    id: string;
    memberName: string;
    oldUid: string;
    newUid: string;
    status: 'approved' | 'rejected';
    decidedAt: string;
    decidedBy: string;
}

interface CardReplacementPageProps {
    pending: PendingRequest[];
    history: HistoryRequest[];
    flash?: {
        success?: string;
        error?: string;
    };
    auth?: {
        user?: {
            permissions?: string[];
        } | null;
    };
    [key: string]: unknown;
}

interface MemberResult {
    id: string;
    name: string;
    memberCode: string;
    phone: string;
    cardUid: string;
    status: string;
}

export default function CardReplacementPage() {
    const { pending, history, flash, auth } = usePage<CardReplacementPageProps>().props;
    const userPermissions = auth?.user?.permissions ?? [];
    const canApprove = userPermissions.includes('cardRequests.approve');
    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const [memberSearch, setMemberSearch] = useState('');
    const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
    const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        old_uid: '',
        new_uid: '',
        reason: 'hilang' as 'hilang' | 'rusak' | 'dicuri' | 'lainnya',
        reason_note: '',
        proof: null as File | null,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            reset();
            setSelectedMember(null);
            setMemberSearch('');
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error, reset]);

    useEffect(() => {
        if (selectedMember) {
            setData(data => ({
                ...data,
                member_id: selectedMember.id,
                old_uid: selectedMember.cardUid || '',
            }));
        }
    }, [selectedMember, setData]);

    const handleSearchMember = async () => {
        if (memberSearch.length < 2) {
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(cardReplacementSearchMember().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ query: memberSearch }),
            });

            if (response.ok) {
                const results = await response.json();
                setMemberResults(results);
            } else {
                setMemberResults([]);
            }
        } catch (error) {
            setMemberResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (memberSearch.length >= 2) {
                handleSearchMember();
            } else {
                setMemberResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [memberSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(cardReplacementStore().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedMember(null);
                setMemberSearch('');
            },
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    toast.error('Gagal mengajukan request penggantian kartu');
                }
            },
        });
    };

    const handleApprove = (requestId: number) => {
        router.post(cardReplacementApprove({ cardRequest: requestId }).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Toast akan muncul dari flash message
            },
            onError: (errors) => {
                const errorMsg = errors?.error || 'Gagal menyetujui request';
                toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
            },
        });
    };

    const handleReject = (requestId: number) => {
        router.post(cardReplacementReject({ cardRequest: requestId }).url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Toast akan muncul dari flash message
            },
            onError: (errors) => {
                const errorMsg = errors?.error || 'Gagal menolak request';
                toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('proof', file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Card Replacement" />
            <div className="flex flex-1 flex-col gap-6 p-4">

                <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Ajukan Penggantian Kartu</CardTitle>
                            <CardDescription>
                                Cari member, input UID baru, dan unggah bukti kehilangan atau kerusakan sebelum request diproses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="member-search">Cari Member</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <UserRoundSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="member-search"
                                                className="pl-10"
                                                placeholder="Nama, nomor telepon, atau kode member"
                                                value={memberSearch}
                                                onChange={(e) => setMemberSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && memberSearch.length >= 2) {
                                                        e.preventDefault();
                                                        handleSearchMember();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={handleSearchMember}
                                            disabled={memberSearch.length < 2 || searchLoading}
                                        >
                                            {searchLoading ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Search className="size-4" />
                                            )}
                                            Cari
                                        </Button>
                                    </div>
                                    {searchLoading && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Loader2 className="size-3 animate-spin" /> Mencari...
                                        </p>
                                    )}
                                    {memberResults.length > 0 && !selectedMember && (
                                        <div className="mt-2 rounded-lg border border-sidebar-border/60 bg-card/80 p-2 max-h-48 overflow-y-auto">
                                            {memberResults.map((member) => (
                                                <button
                                                    key={member.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setMemberSearch(`${member.name} • ${member.phone}`);
                                                        setMemberResults([]);
                                                    }}
                                                    className="w-full text-left rounded-md p-2 hover:bg-muted/50 transition text-sm"
                                                >
                                                    <div className="font-medium text-foreground">{member.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {member.memberCode} • {member.phone} • Status: {member.status}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {selectedMember && (
                                        <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm">
                                            <div className="font-medium text-foreground">{selectedMember.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {selectedMember.memberCode} • {selectedMember.phone}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 h-6 text-xs"
                                                onClick={() => {
                                                    setSelectedMember(null);
                                                    setMemberSearch('');
                                                }}
                                            >
                                                Ubah Member
                                            </Button>
                                        </div>
                                    )}
                                    <InputError message={errors.member_id} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="old-uid">UID Lama</Label>
                                        <Input
                                            id="old-uid"
                                            placeholder="UID lama"
                                            value={data.old_uid}
                                            onChange={(e) => setData('old_uid', e.target.value)}
                                            disabled={!!selectedMember}
                                            readOnly={!!selectedMember}
                                        />
                                        {selectedMember && (
                                            <p className="text-xs text-muted-foreground">UID otomatis terisi dari member yang dipilih</p>
                                        )}
                                        <InputError message={errors.old_uid} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="new-uid">UID Baru</Label>
                                        <Input
                                            id="new-uid"
                                            placeholder="Scan UID baru (9 digit)"
                                            value={data.new_uid}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                setData('new_uid', value);
                                            }}
                                        />
                                        <InputError message={errors.new_uid} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="reason">Alasan</Label>
                                        <Select
                                            value={data.reason}
                                            onValueChange={(value: 'hilang' | 'rusak' | 'dicuri' | 'lainnya') => setData('reason', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hilang">Hilang</SelectItem>
                                                <SelectItem value="rusak">Rusak</SelectItem>
                                                <SelectItem value="dicuri">Dicuri</SelectItem>
                                                <SelectItem value="lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.reason} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="proof">Bukti (foto/PDF)</Label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="proof"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="size-4" />
                                            {data.proof ? data.proof.name : 'Unggah File'}
                                        </Button>
                                        {data.proof && (
                                            <p className="text-xs text-muted-foreground">{data.proof.name}</p>
                                        )}
                                        <InputError message={errors.proof} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="notes">Catatan</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Catatan tambahan untuk approver"
                                        rows={3}
                                        value={data.reason_note}
                                        onChange={(e) => setData('reason_note', e.target.value)}
                                    />
                                    <InputError message={errors.reason_note} />
                                </div>

                                <Button type="submit" className="self-start" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" /> Memproses...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 bg-card/60 shadow-sm dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Guideline Approval</CardTitle>
                            <CardDescription>
                                Pastikan permintaan di-review oleh Owner sesuai matrix permission Spatie.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm text-muted-foreground">
                            <p>• Wajib lampirkan bukti foto atau surat keterangan.</p>
                            <p>• UID baru tidak boleh pernah digunakan sebelumnya.</p>
                            <p>• Status member harus Active sebelum kartu diganti.</p>
                            <p>• Semua perubahan tercatat di audit log.</p>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 bg-card/60 p-6 shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-wrap items-center justify-between gap-2">
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
                        <Badge variant="outline">Guard: web</Badge>
                    </div>

                    {activeTab === 'pending' && (
                        <div className="w-full overflow-x-auto">
                            {pending.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Tidak ada request pending</p>
                            ) : (
                                <table className="w-full min-w-[720px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">UID Lama</th>
                                            <th className="px-4 py-3">UID Baru</th>
                                            <th className="px-4 py-3">Alasan</th>
                                            <th className="px-4 py-3">Bukti</th>
                                            <th className="px-4 py-3">Tanggal Request</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{item.memberName}</span>
                                                        <span className="text-xs text-muted-foreground">{item.memberId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{item.oldUid}</td>
                                                <td className="px-4 py-3">{item.newUid}</td>
                                                <td className="px-4 py-3">{item.reason}</td>
                                                <td className="px-4 py-3">
                                                    {item.proofPath ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2 text-primary hover:bg-primary/10"
                                                            onClick={() => {
                                                                window.open(cardReplacementProof({ cardRequest: item.id }).url, '_blank');
                                                            }}
                                                        >
                                                            <Eye className="size-4" /> Lihat
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{item.requestedAt}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {canApprove ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="gap-2 text-success hover:bg-success/10"
                                                                onClick={() => handleApprove(item.id)}
                                                            >
                                                                <Check className="size-4" /> Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="gap-2 text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleReject(item.id)}
                                                            >
                                                                <X className="size-4" /> Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="w-full overflow-x-auto">
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Tidak ada history</p>
                            ) : (
                                <table className="w-full min-w-[640px] border-collapse text-sm">
                                    <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">ID Request</th>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">UID Lama</th>
                                            <th className="px-4 py-3">UID Baru</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Tanggal Diputuskan</th>
                                            <th className="px-4 py-3">Diputuskan Oleh</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-sidebar-border/60 transition hover:bg-muted/30 dark:border-sidebar-border"
                                            >
                                                <td className="px-4 py-3">{item.id}</td>
                                                <td className="px-4 py-3">{item.memberName}</td>
                                                <td className="px-4 py-3">{item.oldUid}</td>
                                                <td className="px-4 py-3">{item.newUid}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            item.status === 'approved'
                                                                ? 'bg-success/10 text-success border-success/20'
                                                                : 'bg-destructive/10 text-destructive border-destructive/20'
                                                        }
                                                    >
                                                        {item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">{item.decidedAt}</td>
                                                <td className="px-4 py-3">{item.decidedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
