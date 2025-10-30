import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as accountsIndex } from '@/routes/accounts';
import { index as cardReplacementIndex } from '@/routes/card-replacement';
import { index as membersIndex } from '@/routes/members';
import { index as membershipIndex } from '@/routes/membership';
import { index as reportsIndex } from '@/routes/reports';
import { index as rolesPermissionsIndex } from '@/routes/roles-permissions';
import { index as scanIndex } from '@/routes/scan';
import statusCheck from '@/routes/status-check';
import { type NavItem } from '@/types';
import { hasMenuPermission, menuPermissions } from '@/utils/permissions';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    Gauge,
    IdCard,
    LayoutGrid,
    Scan,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Anggota',
        href: membersIndex().url,
        icon: Users,
    },
    {
        title: 'Kartu Langganan',
        href: membershipIndex().url,
        icon: CreditCard,
    },
    {
        title: 'Status Check',
        href: statusCheck.index(),
        icon: Gauge,
    },
    {
        title: 'Scan',
        href: scanIndex(),
        icon: Scan,
    },
    {
        title: 'Penggantian Kartu',
        href: cardReplacementIndex(),
        icon: IdCard,
    },
    {
        title: 'Laporan',
        href: reportsIndex(),
        icon: BarChart3,
    },
    {
        title: 'Akun',
        href: accountsIndex(),
        icon: UserCog,
    },
    {
        title: 'Hak Akses',
        href: rolesPermissionsIndex(),
        icon: ShieldCheck,
    },
];


export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userPermissions: string[] = Array.isArray(auth.user?.permissions) ? auth.user.permissions : [];

    // Filter menu items based on user permissions
    const mainNavItems = useMemo(() => {
        return allNavItems.filter((item) => {
            const requiredPermission = menuPermissions[item.title];
            if (!requiredPermission) {
                // If no permission is mapped, allow access (e.g., Dashboard)
                return true;
            }
            return hasMenuPermission(userPermissions, requiredPermission);
        });
    }, [userPermissions]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
