export const packages = [
    {
        id: 'pkg-basic',
        name: 'Basic',
        price: 299000,
        quota: 1,
        description: 'Cuci mobil 1 kendaraan, kedatangan tanpa batas selama aktif.',
    },
    {
        id: 'pkg-plus',
        name: 'Plus',
        price: 499000,
        quota: 2,
        description: 'Untuk keluarga dengan 2 kendaraan, prioritas antrian.',
    },
    {
        id: 'pkg-premium',
        name: 'Premium',
        price: 669000,
        quota: 3,
        description: 'Termasuk interior detailing ringan untuk 3 kendaraan.',
    },
];

export const members = [
    {
        id: 'M0001',
        name: 'Agus Pratama',
        phone: '+62 812-3456-7890',
        address: 'Jl. Cihampelas No. 45, Bandung',
        packageId: 'pkg-plus',
        cardUid: 'UID-883421',
        status: 'active',
        joinedAt: '2024-01-12',
        expiresAt: '2025-01-11',
        vehicles: [
            { plate: 'D 1234 ABC', color: 'Hitam' },
            { plate: 'D 9876 QWE', color: 'Merah' },
        ],
        visits: [
            { date: '2025-01-02', time: '08:15', plate: 'D 1234 ABC', status: 'allowed' },
            { date: '2024-12-29', time: '17:20', plate: 'D 9876 QWE', status: 'allowed' },
            { date: '2024-12-21', time: '09:45', plate: 'D 1234 ABC', status: 'allowed' },
        ],
    },
    {
        id: 'M0002',
        name: 'Siti Marlina',
        phone: '+62 813-9876-5432',
        address: 'Jl. Dr. Sutomo No. 12, Cimahi',
        packageId: 'pkg-basic',
        cardUid: 'UID-772314',
        status: 'active',
        joinedAt: '2024-06-01',
        expiresAt: '2025-05-31',
        vehicles: [{ plate: 'D 5555 ZZZ', color: 'Putih' }],
        visits: [
            { date: '2025-01-03', time: '10:05', plate: 'D 5555 ZZZ', status: 'allowed' },
            { date: '2024-12-24', time: '18:40', plate: 'D 5555 ZZZ', status: 'allowed' },
        ],
    },
    {
        id: 'M0003',
        name: 'Bagus Saputra',
        phone: '+62 812-7788-9911',
        address: 'Kompleks Nata Endah Blok B7, Bandung',
        packageId: 'pkg-premium',
        cardUid: 'UID-665432',
        status: 'expired',
        joinedAt: '2023-11-10',
        expiresAt: '2024-11-09',
        vehicles: [
            { plate: 'D 1928 HJK', color: 'Silver' },
            { plate: 'D 8881 KLM', color: 'Biru' },
            { plate: 'D 2207 RST', color: 'Hitam' },
        ],
        visits: [
            { date: '2024-11-09', time: '15:10', plate: 'D 1928 HJK', status: 'blocked' },
            { date: '2024-10-30', time: '11:25', plate: 'D 8881 KLM', status: 'allowed' },
        ],
    },
    {
        id: 'M0004',
        name: 'Lestari Wening',
        phone: '+62 815-4400-2211',
        address: 'Jl. Sunda No. 8, Bandung',
        packageId: 'pkg-plus',
        cardUid: 'UID-903344',
        status: 'inactive',
        joinedAt: '2024-03-15',
        expiresAt: '2025-03-14',
        vehicles: [
            { plate: 'D 4567 RTY', color: 'Abu-abu' },
            { plate: 'D 1238 LOP', color: 'Hijau' },
        ],
        visits: [
            { date: '2024-12-30', time: '13:30', plate: 'D 4567 RTY', status: 'blocked' },
        ],
    },
];

export const todayVisits = [
    {
        id: 1,
        time: '08:05',
        memberId: 'M0001',
        memberName: 'Agus Pratama',
        plate: 'D 1234 ABC',
        status: 'allowed',
    },
    {
        id: 2,
        time: '09:32',
        memberId: 'M0002',
        memberName: 'Siti Marlina',
        plate: 'D 5555 ZZZ',
        status: 'allowed',
    },
    {
        id: 3,
        time: '10:41',
        memberId: 'M0003',
        memberName: 'Bagus Saputra',
        plate: 'D 1928 HJK',
        status: 'blocked',
        reason: 'Membership expired',
    },
];

export const cardReplacementRequests = {
    pending: [
        {
            id: 'REQ-001',
            memberId: 'M0004',
            memberName: 'Lestari Wening',
            oldUid: 'UID-903344',
            newUid: 'UID-903345',
            reason: 'Lost card',
            proof: 'lost-card-lestari.jpg',
            requestedAt: '2025-01-03 09:15',
        },
        {
            id: 'REQ-002',
            memberId: 'M0002',
            memberName: 'Siti Marlina',
            oldUid: 'UID-772314',
            newUid: 'UID-772399',
            reason: 'Damaged card',
            proof: 'damage-siti.png',
            requestedAt: '2025-01-02 16:45',
        },
    ],
    history: [
        {
            id: 'REQ-0004',
            memberName: 'Agus Pratama',
            oldUid: 'UID-883420',
            newUid: 'UID-883421',
            status: 'approved',
            decidedAt: '2024-12-18 14:20',
            decidedBy: 'Rina (Manager)',
        },
        {
            id: 'REQ-0003',
            memberName: 'Bagus Saputra',
            oldUid: 'UID-665430',
            newUid: 'UID-665432',
            status: 'rejected',
            decidedAt: '2024-11-10 10:10',
            decidedBy: 'Rina (Manager)',
        },
    ],
};

export const roles = [
    {
        name: 'Owner',
        guardName: 'web',
        usersCount: 2,
        permissions: [
            'members.view',
            'members.create',
            'members.update',
            'members.delete',
            'vehicles.create',
            'vehicles.update',
            'vehicles.delete',
            'scan.use',
            'status.check',
            'reports.view',
            'accounts.manage',
            'roles.manage',
            'permissions.manage',
            'cardRequests.request',
            'cardRequests.approve',
        ],
    },
    {
        name: 'Manager',
        guardName: 'web',
        usersCount: 4,
        permissions: [
            'members.view',
            'members.create',
            'members.update',
            'vehicles.create',
            'vehicles.update',
            'vehicles.delete',
            'scan.use',
            'status.check',
            'reports.view',
            'cardRequests.approve',
        ],
    },
    {
        name: 'Cashier',
        guardName: 'web',
        usersCount: 8,
        permissions: ['members.view', 'scan.use', 'status.check'],
    },
];

export const permissions = [
    { name: 'members.view', guardName: 'web', roles: ['Owner', 'Manager', 'Cashier'] },
    { name: 'members.create', guardName: 'web', roles: ['Owner', 'Manager'] },
    { name: 'members.update', guardName: 'web', roles: ['Owner', 'Manager'] },
    { name: 'members.delete', guardName: 'web', roles: ['Owner'] },
    { name: 'vehicles.create', guardName: 'web', roles: ['Owner', 'Manager'] },
    { name: 'vehicles.update', guardName: 'web', roles: ['Owner', 'Manager'] },
    { name: 'vehicles.delete', guardName: 'web', roles: ['Owner'] },
    { name: 'scan.use', guardName: 'web', roles: ['Owner', 'Manager', 'Cashier'] },
    { name: 'status.check', guardName: 'web', roles: ['Owner', 'Manager', 'Cashier'] },
    { name: 'reports.view', guardName: 'web', roles: ['Owner', 'Manager'] },
    { name: 'accounts.manage', guardName: 'web', roles: ['Owner'] },
    { name: 'roles.manage', guardName: 'web', roles: ['Owner'] },
    { name: 'permissions.manage', guardName: 'web', roles: ['Owner'] },
    { name: 'cardRequests.request', guardName: 'web', roles: ['Owner', 'Manager'] },
    { name: 'cardRequests.approve', guardName: 'web', roles: ['Owner', 'Manager'] },
];

export const accounts = [
    {
        id: 1,
        name: 'Rina Kusuma',
        email: 'rina@infinitewash.id',
        roles: ['Owner'],
        status: 'Active',
        lastLogin: '2025-01-03 07:45',
    },
    {
        id: 2,
        name: 'Dana Wirawan',
        email: 'dana@infinitewash.id',
        roles: ['Manager'],
        status: 'Active',
        lastLogin: '2025-01-02 19:12',
    },
    {
        id: 3,
        name: 'Putri Ramadhani',
        email: 'putri@infinitewash.id',
        roles: ['Cashier'],
        status: 'Active',
        lastLogin: '2025-01-03 11:05',
    },
    {
        id: 4,
        name: 'Irwan Setiawan',
        email: 'irwan@infinitewash.id',
        roles: ['Cashier'],
        status: 'Suspended',
        lastLogin: '2024-12-27 16:40',
    },
];

export const backupLogs = [
    { id: 1, status: 'success', timestamp: '2025-01-03 06:30', message: 'Synced 152 members to Google Sheets.' },
    { id: 2, status: 'error', timestamp: '2025-01-02 20:15', message: 'Auth token expired during sync attempt.' },
    { id: 3, status: 'success', timestamp: '2025-01-01 06:20', message: 'Synced visits and card requests.' },
];

export const auditLog = [
    {
        id: 1,
        message: "Role 'Manager' granted permission 'reports.view' by Rina at 2025-01-02 18:12",
    },
    {
        id: 2,
        message: "Role 'Cashier' revoked permission 'members.update' by Dana at 2025-01-01 10:03",
    },
    {
        id: 3,
        message: "User 'Putri' assigned role 'Cashier' by Rina at 2024-12-29 09:44",
    },
];

export const reportsSummary = {
    visitsToday: 128,
    activeMembers: 432,
    newMembersMonth: 38,
    vehiclesRegistered: 589,
};

export const visitsByDay = [
    { day: 'Sen', value: 110 },
    { day: 'Sel', value: 134 },
    { day: 'Rab', value: 129 },
    { day: 'Kam', value: 142 },
    { day: 'Jum', value: 155 },
    { day: 'Sab', value: 120 },
    { day: 'Min', value: 98 },
];

export const monthlyNewMembers = [
    { month: 'Jul', value: 22 },
    { month: 'Agu', value: 28 },
    { month: 'Sep', value: 31 },
    { month: 'Okt', value: 35 },
    { month: 'Nov', value: 33 },
    { month: 'Des', value: 42 },
];

export const packageDistribution = [
    { name: 'Basic', percentage: 38 },
    { name: 'Plus', percentage: 41 },
    { name: 'Premium', percentage: 21 },
];

export const syncStatus = {
    connected: true,
    webAppUrl: 'https://script.google.com/macros/s/infinitewash-sync/exec',
    lastSync: '2025-01-03 06:30',
};

export const scanHistory = [
    {
        id: 1,
        time: '08:02',
        memberName: 'Agus Pratama',
        plate: 'D 1234 ABC',
        status: 'Allowed',
    },
    {
        id: 2,
        time: '08:47',
        memberName: 'Siti Marlina',
        plate: 'D 5555 ZZZ',
        status: 'Allowed',
    },
    {
        id: 3,
        time: '09:22',
        memberName: 'Bagus Saputra',
        plate: 'D 1928 HJK',
        status: 'Blocked - expired',
    },
    {
        id: 4,
        time: '10:11',
        memberName: 'Lestari Wening',
        plate: 'D 4567 RTY',
        status: 'Allowed',
    },
];
