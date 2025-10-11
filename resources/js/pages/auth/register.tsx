import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';

export default function Register() {
    return (
        <AuthLayout
            title="Registration disabled"
            description="Member accounts are provisioned internally by the InfiniteWash team."
        >
            <Head title="Registration disabled" />
            <div className="flex flex-col items-center gap-6 rounded-lg border border-border/60 bg-card/80 p-8 text-center shadow-sm">
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">
                        Self-service sign-up is unavailable
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        To obtain access, please reach out to your site administrator so they can
                        create an account for you.
                    </p>
                </div>
                <Button asChild className="px-6">
                    <Link href={login()}>
                        Return to login
                    </Link>
                </Button>
            </div>
        </AuthLayout>
    );
}
