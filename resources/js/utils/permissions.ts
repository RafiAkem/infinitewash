/**
 * Mapping menu items to required permissions
 * - Single permission: User must have that permission
 * - Array of permissions: User must have at least ONE of the permissions
 */
export const menuPermissions: Record<string, string | string[]> = {
    'Dashboard': ['members.view'], // Dashboard bisa diakses siapa saja yang punya basic access
    'Anggota': 'members.view',
    'Kartu Langganan': 'memberships.view',
    'Status Check': 'status.check',
    'Scan': 'scan.use',
    'Penggantian Kartu': ['cardRequests.request', 'cardRequests.approve'], // Bisa request ATAU approve
    'Laporan': 'reports.view',
    'Akun': 'accounts.manage',
    'Hak Akses': 'permissions.manage',
};

/**
 * Check if user has permission to access a menu item
 */
export function hasMenuPermission(userPermissions: string[], requiredPermission: string | string[]): boolean {
    if (Array.isArray(requiredPermission)) {
        // User needs at least one of the permissions
        return requiredPermission.some((perm) => userPermissions.includes(perm));
    }
    return userPermissions.includes(requiredPermission);
}

