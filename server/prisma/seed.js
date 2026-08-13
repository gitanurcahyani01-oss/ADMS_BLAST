import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';

const PERMISSIONS_DATA = [
  // Dashboard
  { code: 'dashboard.view', name: 'Lihat Dashboard', module: 'dashboard', description: 'Melihat statistik ringkasan dan performa' },

  // Users
  { code: 'users.view', name: 'Lihat Pengguna', module: 'users', description: 'Melihat daftar pengguna/klien' },
  { code: 'users.create', name: 'Tambah Pengguna', module: 'users', description: 'Membuat akun pengguna baru' },
  { code: 'users.edit', name: 'Edit Pengguna', module: 'users', description: 'Mengubah profil pengguna' },
  { code: 'users.delete', name: 'Hapus Pengguna', module: 'users', description: 'Menghapus pengguna' },
  { code: 'users.suspend', name: 'Suspend/Aktifkan Pengguna', module: 'users', description: 'Menangguhkan atau mengaktifkan pengguna' },

  // Admins
  { code: 'admins.view', name: 'Lihat Admin', module: 'admins', description: 'Melihat daftar tim admin' },
  { code: 'admins.create', name: 'Tambah Admin', module: 'admins', description: 'Membuat admin pengelola baru' },
  { code: 'admins.edit', name: 'Edit Admin', module: 'admins', description: 'Mengubah data admin' },
  { code: 'admins.delete', name: 'Hapus Admin', module: 'admins', description: 'Menghapus admin' },
  { code: 'admins.permissions', name: 'Atur Permission Admin', module: 'admins', description: 'Memberikan atau mencabut permission admin' },

  // Roles & Permissions
  { code: 'roles.view', name: 'Lihat Role', module: 'roles', description: 'Melihat daftar role RBAC' },
  { code: 'roles.create', name: 'Tambah Role', module: 'roles', description: 'Membuat role kustom baru' },
  { code: 'roles.edit', name: 'Edit Role', module: 'roles', description: 'Mengubah konfigurasi role' },
  { code: 'roles.delete', name: 'Hapus Role', module: 'roles', description: 'Menghapus role' },
  { code: 'permissions.view', name: 'Lihat Permissions', module: 'permissions', description: 'Melihat katalog hak akses' },
  { code: 'permissions.manage', name: 'Kelola Permissions', module: 'permissions', description: 'Mengatur mapping permissions' },

  // Contacts
  { code: 'contacts.view', name: 'Lihat Kontak', module: 'contacts', description: 'Melihat daftar kontak/pelanggan' },
  { code: 'contacts.create', name: 'Tambah Kontak', module: 'contacts', description: 'Menambah kontak baru secara manual' },
  { code: 'contacts.edit', name: 'Edit Kontak', module: 'contacts', description: 'Mengubah data kontak' },
  { code: 'contacts.delete', name: 'Hapus Kontak', module: 'contacts', description: 'Menghapus kontak' },
  { code: 'contacts.import', name: 'Import Kontak', module: 'contacts', description: 'Import kontak dari CSV/Excel' },
  { code: 'contacts.export', name: 'Export Kontak', module: 'contacts', description: 'Export kontak ke CSV/Excel' },

  // Lists & Tags
  { code: 'lists.view', name: 'Lihat Segmentasi/List', module: 'lists', description: 'Melihat daftar list segmentasi kontak' },
  { code: 'lists.create', name: 'Buat List', module: 'lists', description: 'Membuat list segmentasi baru' },
  { code: 'lists.edit', name: 'Edit List', module: 'lists', description: 'Mengubah data list' },
  { code: 'lists.delete', name: 'Hapus List', module: 'lists', description: 'Menghapus list' },
  { code: 'tags.view', name: 'Lihat Tag', module: 'tags', description: 'Melihat tag label kontak' },
  { code: 'tags.create', name: 'Buat Tag', module: 'tags', description: 'Membuat label tag baru' },
  { code: 'tags.edit', name: 'Edit Tag', module: 'tags', description: 'Mengubah tag' },
  { code: 'tags.delete', name: 'Hapus Tag', module: 'tags', description: 'Menghapus tag' },

  // Broadcast & Campaign
  { code: 'broadcast.view', name: 'Lihat Broadcast', module: 'broadcast', description: 'Melihat riwayat dan antrean broadcast' },
  { code: 'broadcast.create', name: 'Buat Broadcast', module: 'broadcast', description: 'Menyiapkan blast pesan massal' },
  { code: 'broadcast.edit', name: 'Edit Broadcast', module: 'broadcast', description: 'Mengubah draf broadcast' },
  { code: 'broadcast.delete', name: 'Hapus Broadcast', module: 'broadcast', description: 'Menghapus broadcast' },
  { code: 'broadcast.send', name: 'Kirim Broadcast', module: 'broadcast', description: 'Mengeksekusi pengiriman broadcast' },
  { code: 'broadcast.schedule', name: 'Jadwalkan Broadcast', module: 'broadcast', description: 'Menjadwalkan waktu kirim pesan' },

  { code: 'campaign.view', name: 'Lihat Campaign', module: 'campaign', description: 'Melihat daftar campaign marketing' },
  { code: 'campaign.create', name: 'Buat Campaign', module: 'campaign', description: 'Membuat campaign baru' },
  { code: 'campaign.edit', name: 'Edit Campaign', module: 'campaign', description: 'Mengubah campaign' },
  { code: 'campaign.delete', name: 'Hapus Campaign', module: 'campaign', description: 'Menghapus campaign' },
  { code: 'campaign.run', name: 'Jalankan Campaign', module: 'campaign', description: 'Memulai eksekusi campaign' },

  // Automation, Auto Reply & Follow-Up
  { code: 'automation.view', name: 'Lihat Automation', module: 'automation', description: 'Melihat alur otomasi pesan' },
  { code: 'automation.create', name: 'Buat Automation', module: 'automation', description: 'Merancang workflow otomatis' },
  { code: 'automation.edit', name: 'Edit Automation', module: 'automation', description: 'Mengubah workflow otomatis' },
  { code: 'automation.delete', name: 'Hapus Automation', module: 'automation', description: 'Menghapus otomasi' },

  { code: 'auto_reply.view', name: 'Lihat Auto Reply', module: 'auto_reply', description: 'Melihat kata kunci auto reply' },
  { code: 'auto_reply.manage', name: 'Kelola Auto Reply', module: 'auto_reply', description: 'Mengatur respon pintar kata kunci' },

  { code: 'follow_up.view', name: 'Lihat Follow Up', module: 'follow_up', description: 'Melihat urutan follow up terjadwal' },
  { code: 'follow_up.manage', name: 'Kelola Follow Up', module: 'follow_up', description: 'Mengatur jeda waktu & pesan follow up' },

  // Tracking & Templates
  { code: 'tracking.view', name: 'Lihat Tracking Link', module: 'tracking', description: 'Melihat klik dan CTR link promosi' },
  { code: 'tracking.create', name: 'Buat Tracking Link', module: 'tracking', description: 'Membuat shortlink tracking konversi' },

  { code: 'templates.view', name: 'Lihat Template Pesan', module: 'templates', description: 'Melihat template pesan tersimpan' },
  { code: 'templates.create', name: 'Buat Template', module: 'templates', description: 'Membuat template pesan & media' },
  { code: 'templates.edit', name: 'Edit Template', module: 'templates', description: 'Mengubah template' },
  { code: 'templates.delete', name: 'Hapus Template', module: 'templates', description: 'Menghapus template' },

  // Reports
  { code: 'reports.view', name: 'Lihat Laporan Analytics', module: 'reports', description: 'Melihat analitik pengiriman & konversi' },
  { code: 'reports.export', name: 'Export Laporan', module: 'reports', description: 'Mengunduh laporan PDF/CSV/Excel' },

  // WhatsApp
  { code: 'whatsapp.view', name: 'Lihat Koneksi WhatsApp', module: 'whatsapp', description: 'Melihat status nomor WhatsApp terhubung' },
  { code: 'whatsapp.connect', name: 'Hubungkan WhatsApp', module: 'whatsapp', description: 'Scan QR dan menghubungkan nomor' },
  { code: 'whatsapp.disconnect', name: 'Putus Koneksi WhatsApp', module: 'whatsapp', description: 'Memutuskan sesi perangkat' },

  // SaaS Billing & Subscriptions
  { code: 'billing.view', name: 'Lihat Billing & Paket', module: 'billing', description: 'Melihat paket dan invoice' },
  { code: 'billing.manage', name: 'Kelola Paket SaaS', module: 'billing', description: 'Mengatur paket harga dan kuota platform' },

  // System Settings & Security
  { code: 'settings.view', name: 'Lihat Pengaturan', module: 'settings', description: 'Melihat konfigurasi aplikasi' },
  { code: 'settings.manage', name: 'Kelola Pengaturan Sistem', module: 'settings', description: 'Mengubah konfigurasi global platform' },
  { code: 'audit_log.view', name: 'Lihat Audit Log Keamanan', module: 'audit_log', description: 'Melihat rekaman jejak audit sistem' },
];

const SUBSCRIPTION_PLANS = [
  {
    name: 'Free Trial',
    code: 'FREE',
    description: 'Cocok untuk mencoba fitur dasar WhatsApp Marketing',
    price: 0,
    maxUsers: 1,
    maxContacts: 500,
    maxWhatsApp: 1,
    maxBroadcasts: 5,
    maxMessages: 1000,
    maxCampaigns: 2,
    maxAutomations: 2,
    maxTemplates: 5,
    isActive: true,
  },
  {
    name: 'Starter Business',
    code: 'STARTER',
    description: 'Solusi tepat untuk UMKM dan online shop pemula',
    price: 149000,
    maxUsers: 3,
    maxContacts: 3000,
    maxWhatsApp: 2,
    maxBroadcasts: 50,
    maxMessages: 10000,
    maxCampaigns: 10,
    maxAutomations: 5,
    maxTemplates: 20,
    isActive: true,
  },
  {
    name: 'Professional',
    code: 'PRO',
    description: 'Pilihan terfavorit bagi brand berkembang dengan retargeting cerdas',
    price: 299000,
    maxUsers: 10,
    maxContacts: 15000,
    maxWhatsApp: 5,
    maxBroadcasts: 999999,
    maxMessages: 50000,
    maxCampaigns: 50,
    maxAutomations: 20,
    maxTemplates: 100,
    isActive: true,
  },
  {
    name: 'Business Scale',
    code: 'BUSINESS',
    description: 'Kapasitas tinggi untuk agensi dan enterprise marketing team',
    price: 599000,
    maxUsers: 25,
    maxContacts: 50000,
    maxWhatsApp: 15,
    maxBroadcasts: 999999,
    maxMessages: 250000,
    maxCampaigns: 200,
    maxAutomations: 100,
    maxTemplates: 500,
    isActive: true,
  },
  {
    name: 'Enterprise Dedicated',
    code: 'ENTERPRISE',
    description: 'Dedicated infrastructure, custom quota & high concurrency limits',
    price: 1499000,
    maxUsers: 100,
    maxContacts: 500000,
    maxWhatsApp: 50,
    maxBroadcasts: 999999,
    maxMessages: 1000000,
    maxCampaigns: 1000,
    maxAutomations: 500,
    maxTemplates: 2000,
    isActive: true,
  },
];

export async function runSeed(clean = true) {
  try {
    console.log('🌱 Starting Enterprise RBAC & Multi-Tenant Seed...');

    const defaultPassword = await bcrypt.hash('Password123!', 10);
    const superAdminPassword = await bcrypt.hash('passwordsuper123!', 10);

  // 1. Clean existing records in safe reverse order
  if (clean) {
    await prisma.blastLog.deleteMany().catch(() => {});
    await prisma.blastCampaign.deleteMany().catch(() => {});
    await prisma.auditLog.deleteMany().catch(() => {});
    await prisma.device.deleteMany().catch(() => {});
    await prisma.subscription.deleteMany().catch(() => {});
    await prisma.subscriptionPlan.deleteMany().catch(() => {});
    await prisma.workspaceUser.deleteMany().catch(() => {});
    await prisma.workspace.deleteMany().catch(() => {});
    await prisma.userRole.deleteMany().catch(() => {});
    await prisma.rolePermission.deleteMany().catch(() => {});
    await prisma.permission.deleteMany().catch(() => {});
    await prisma.role.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    console.log('🧹 Cleaned existing database records.');
  }

  // 2. Seed Permissions
  const createdPermissions = {};
  for (const perm of PERMISSIONS_DATA) {
    const created = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions[perm.code] = created.id;
  }
  console.log(`🔑 Seeded ${PERMISSIONS_DATA.length} granular permissions.`);

  // 3. Seed Standard Roles
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Pemilik platform dengan kendali global tak terbatas',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      name: 'Admin Operasional',
      code: 'ADMIN',
      description: 'Manajer operasional dengan wewenang seluruh modul workspace',
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      name: 'Pengguna / Klien',
      code: 'USER',
      description: 'Pengguna SaaS biasa dengan isolasi data workspace mandiri',
      isSystem: true,
    },
  });

  console.log('🛡️ Seeded standard & custom roles.');

  // 4. Assign Permissions to Roles
  for (const permCode of Object.keys(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: createdPermissions[permCode],
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: createdPermissions[permCode],
      },
    }).catch(() => {});
  }

  // 5. Seed Subscription Plans
  const seededPlans = {};
  for (const plan of SUBSCRIPTION_PLANS) {
    const createdPlan = await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {},
      create: plan,
    });
    seededPlans[plan.code] = createdPlan;
  }
  console.log(`📦 Seeded ${SUBSCRIPTION_PLANS.length} SaaS subscription plans.`);

  // 6. Seed Super Admin User if not exists
  let superAdmin = await prisma.user.findUnique({
    where: { email: 'superadmin@admsblast.com' },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        name: 'Satria Super Admin',
        email: 'superadmin@admsblast.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '081234567890',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    }).catch(() => {});

    // Master Workspace
    const masterWorkspace = await prisma.workspace.upsert({
      where: { slug: 'adms-hq-master' },
      update: {},
      create: {
        name: 'ADMS HQ Master',
        slug: 'adms-hq-master',
        ownerId: superAdmin.id,
        status: 'ACTIVE',
      },
    });

    await prisma.workspaceUser.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: masterWorkspace.id,
          userId: superAdmin.id,
        },
      },
      update: {},
      create: {
        workspaceId: masterWorkspace.id,
        userId: superAdmin.id,
        role: 'SUPER_ADMIN',
      },
    }).catch(() => {});

    // Also create user's personal account
    const userPersonalPassword = await bcrypt.hash('bintang123', 10);
    const personalUser = await prisma.user.upsert({
      where: { email: 'alparezisatria@gmail.com' },
      update: { password: userPersonalPassword, role: 'SUPER_ADMIN', status: 'ACTIVE' },
      create: {
        name: 'Satria Alparezi',
        email: 'alparezisatria@gmail.com',
        password: userPersonalPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        phone: '081234567890',
        currentWorkspaceId: masterWorkspace.id,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: personalUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: personalUser.id,
        roleId: superAdminRole.id,
      },
    }).catch(() => {});

      await prisma.workspaceUser.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: masterWorkspace.id,
            userId: personalUser.id,
          },
        },
        update: {},
        create: {
          workspaceId: masterWorkspace.id,
          userId: personalUser.id,
          role: 'SUPER_ADMIN',
        },
      }).catch(() => {});
    }

    console.log('✅ Enterprise RBAC & Multi-Tenant database seeding completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

export default runSeed;
