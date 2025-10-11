PROJECT
Name: InfiniteWash – Membership System (Admin Web App)
Goal: Design a full admin UI for a car wash membership business. Backend will use Laravel 12 + Inertia + Tailwind and **spatie/laravel-permission** for authorization. Build screens for: onboarding members, vehicle quota by package, status check, scan visits, card replacement workflow + approvals, analytics reports, and **Spatie-based user/role/permission management**, plus optional Google Sheets backup.

AUDIENCE & CONTEXT
Primary users: Owner, Manager, Cashier. Used daily at the counter (fast, keyboard-friendly) and by management (reports, approvals). Support light/dark themes and responsive desktop→mobile.

DESIGN SYSTEM
- Style: modern, enterprise-clean, whitespace; rounded 12–16px; subtle shadows.
- Colors: Primary #2563EB; Success #10B981; Warning #F59E0B; Danger #EF4444; Neutral #111827/#6B7280.
- Type: Inter or Plus Jakarta Sans (12/14/16/20/24/32).
- Grid: 12-col, 24px gutters, 1200–1440px container; tablet/mobile variants.
- Components: App bar, left nav, breadcrumb, page headers, cards, tables (sortable/filterable/paginated), forms, wizards, tabs, modals, stepper, toasts, badges, empty/loading states, skeletons, role/permission matrix.

NAVIGATION (Sidebar)
Dashboard, Members, Membership, Status Check, Scan, Card Replacement (Requests), Reports, **Accounts**, **Roles & Permissions**, Backup (Google Sheets), Settings.

DATA MODEL HINTS (realistic examples)
Packages: 299k=1 vehicle, 499k=2, 669k=3.
Member: member_code, name, phone, address, card_uid, package, status (active/inactive/expired), created_at.
Vehicle: plate, color. Membership: valid_from, valid_to, status (active/expired/grace).
Visit: date, time, status (allowed/blocked).
Card Request: old_uid, new_uid, reason (lost/damaged/stolen/other), proof, status (pending/approved/rejected), requested_at, decided_at, decided_by.
Account (User): name, email/username, role(s), status, last_login.

SPATIE (MUST-HAVE UI & TERMINOLOGY)
- Roles & permissions follow **spatie/laravel-permission** (no role inheritance).
- Show **guard_name** (default “web”) where relevant.
- Permissions are slugged; examples to include in UI:
  members.view, members.create, members.update, members.delete,
  vehicles.create, vehicles.update, vehicles.delete,
  scan.use, status.check,
  reports.view,
  accounts.manage,
  roles.manage, permissions.manage,
  cardRequests.request, cardRequests.approve
- Provide **preset roles**:
  - Owner: all permissions (select-all).
  - Manager: operations (members.* except delete, vehicles.*, scan.use, status.check, reports.view, cardRequests.approve).
  - Cashier: minimal (members.view, scan.use, status.check).
- Show **effective permissions** for a user (union of role permissions + direct user permissions).
- Actions supported: create/edit/delete Role; assign/revoke permissions to Role; assign/revoke Role to User; (optional) grant direct permission to User; “Sync” patterns common in Spatie (replace set).
- Visual cues: chips/badges for Role and Permission; guard selector (if multiple guards later).
- Safety: destructive actions need confirmation modals.

PAGES (each in its own frame; desktop + mobile + dark)
1) Dashboard
   - KPI: Total Members, Active Members, Today’s Visits, Total Vehicles.
   - Time filter; visits chart (line/bar).
   - Mini-table: “Today’s Membership Visits”.
   - Panel: “Pending Card Replacement” (count + items).
   - Quick Actions: Add Member, Start Scan, Open Reports.

2) Members (List)
   - Search (name/phone), filter (package/status/date).
   - Table: Member Code, Name, Phone, Package, Card UID, Status, Actions.
   - Bulk select + bulk delete; Export CSV.
   - Empty & loading states; “Add Member” button.

3) Member Detail
   - Header: name + member_code, status badge, validity progress (days left).
   - Tabs:
     a) Profile (phone, address, card_uid),
     b) Vehicles (cards/table with plate & color; enforce quota hint),
     c) Membership (history; extend button),
     d) Visits (date, time, plate, status).
   - Quick actions: Request Card Replacement, Extend Membership.

4) New Member – Wizard (3 steps)
   - Step 1: Member info (name, phone with +62 helper, address).
   - Step 2: Package (299k/499k/669k) → dynamically render N vehicle inputs (plate, color).
   - Step 3: Card UID + review summary; “Create”.
   - Inline validation, back/next, error states.

5) Status Check
   - Input: Card UID OR phone → “Check”.
   - Result: member summary (package, validity bar, vehicles list, Active/Expired).
   - Empty & not-found states.

6) Scan
   - Large UID input (auto-focus), Enter triggers scan.
   - Result banner: Allowed (green) / Blocked (red) + reason (expired/not found).
   - “Today’s Scans” table (time, member, plate, status) + daily counter.

7) Card Replacement (Requests)
   - Request form: search member by phone → compact card; fields: new UID, reason (lost/damaged/stolen/other), file upload proof; submit.
   - Tabs:
     a) Pending Approvals: table (member, old/new UID, reason, proof thumbnail, requested_at) + Approve/Reject actions (note modal).
     b) History: table with filters; decided_at & decided_by shown.
   - Confirmations + toasts.

8) Reports
   - Date filters (presets & custom).
   - KPI (Visits, Active Members, New Members, Vehicles Registered).
   - Charts: visits per day (line), monthly aggregation (bar), package distribution (donut).
   - Table: visits within range; Export CSV.

9) **Accounts (Users) – Spatie-aware**
   - Search; filter by Role, Status.
   - Table: Name, Email/Username, Roles (chips), Status, Last Login, Actions.
   - Drawer/Modal: Create/Edit User (name, email/username, password reset, status toggle).
   - **Assign Roles UI**: multi-select roles (Owner/Manager/Cashier or custom).
   - **Direct Permissions (optional)**: multi-select permissions; show warning: “Direct permissions override role presets.”
   - Footer summary: “Effective permissions: [list chips]”.

10) **Roles & Permissions – Spatie Matrix**
    - Tabs: Roles | Permissions | Audit
    - **Roles tab**:
      - List of roles (name, guard_name, users count).
      - Actions: Create/Edit/Delete role (guard_name selector).
      - **Role Detail panel**:
        - Matrix/grid of permissions (grouped by domain: Members, Vehicles, Scan/Status, Reports, Accounts, Roles, Permissions, Card Requests).
        - Buttons: “Grant all”, “Revoke all”, “Apply”, “Reset to Preset (Owner/Manager/Cashier)”.
        - Info note: “Spatie has no role inheritance; permissions are explicitly assigned.”
    - **Permissions tab**:
      - List of permissions (name/slug, guard_name, assigned roles count).
      - Create/Edit/Delete permission (supports namespacing like members.view).
      - Bulk assign to roles (multi-select) with Apply.
    - **Audit tab**:
      - Read-only log sample: “Role ‘Manager’ granted permission ‘reports.view’ by [user] at [timestamp]”.
      - Export button.

11) Backup (Google Sheets)
    - Status card (Connected/Not Connected), input for Web App URL.
    - Buttons: Test Connection, Sync Now.
    - Recent Sync Log with tags (success/error).

12) Settings
    - Branding (logo), Theme (light/dark/system), Date format, Timezone.
    - Upload limits (proof), Phone validation (Indonesia), Language (ID/EN).
    - Access note: only users with **accounts.manage** OR **roles.manage** can change sensitive settings.

GLOBAL UX RULES
- Keyboard friendly; primary CTA on the right.
- Sticky table headers; pagination; column sort; column visibility menu.
- Confirmations for destructive updates (Delete Role, Revoke All, Reject Request).
- Toasts/snackbars for success/error; inline validation messages.
- Accessibility: AA contrast, focus rings, aria labels for critical controls.

CONTENT & REAL DATA
- Use Indonesian names and license plates (e.g., “D 1234 ABC”) and +62 phone formats.
- Populate examples so tables look real (member codes like M0001).
- In Role/Permission screens, use the Spatie slugs shown above and display guard_name “web”.

DELIVERABLES
- Frames for each page (desktop + mobile) and dark variants.
- A “Design System” frame with tokens (colors, typography, spacing), and a reusable component library (buttons, inputs, selects, date pickers, file upload, badges, modals, tabs, stepper, table, pagination, toast, empty/skeleton, **role/permission matrix**).
- Clear layer/component names; components reusable across pages.
- Annotate logic hotspots (vehicle quota by package; effective permissions; no role inheritance; guard_name display; preset roles behavior).
