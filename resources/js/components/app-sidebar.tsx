import { NavFooter } from '@/components/nav-footer';
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
import { index as backupIndex } from '@/routes/backup';
import { index as cardReplacementIndex } from '@/routes/card-replacement';
import { index as membersIndex } from '@/routes/members';
import { index as membershipIndex } from '@/routes/membership';
import { index as reportsIndex } from '@/routes/reports';
import { index as rolesPermissionsIndex } from '@/routes/roles-permissions';
import { index as scanIndex } from '@/routes/scan';
import { index as statusCheckIndex } from '@/routes/status-check';
import { admin as adminSettingsIndex } from '@/routes/settings';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CloudUpload,
    CreditCard,
    Folder,
    Gauge,
    IdCard,
    LayoutGrid,
    Scan,
    Settings2,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Members',
        href: membersIndex().url,
        icon: Users,
    },
    {
        title: 'Membership',
        href: membershipIndex().url,
        icon: CreditCard,
    },
    {
        title: 'Status Check',
        href: statusCheckIndex(),
        icon: Gauge,
    },
    {
        title: 'Scan',
        href: scanIndex(),
        icon: Scan,
    },
    {
        title: 'Card Replacement',
        href: cardReplacementIndex(),
        icon: IdCard,
    },
    {
        title: 'Reports',
        href: reportsIndex(),
        icon: BarChart3,
    },
    {
        title: 'Accounts',
        href: accountsIndex(),
        icon: UserCog,
    },
    {
        title: 'Roles & Permissions',
        href: rolesPermissionsIndex(),
        icon: ShieldCheck,
    },
    {
        title: 'Backup',
        href: backupIndex(),
        icon: CloudUpload,
    },
    {
        title: 'Settings',
        href: adminSettingsIndex(),
        icon: Settings2,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
