import prisma from '../prisma.js';

/**
 * Normalize Indonesian phone number
 * 08123456789 -> 628123456789
 * +62 812-3456-789 -> 628123456789
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  let clean = phone.toString().replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
};

/**
 * GET /api/contacts
 * List contacts with search, pagination, and tags filter
 */
export const getContacts = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const { search, tag, listId, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const where = isSuperAdmin && !req.query.workspaceOnly ? {} : { workspaceId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (tag) {
      where.tags = { array_contains: tag };
    }

    if (listId) {
      where.listMembers = { some: { listId } };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          listMembers: {
            include: { list: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        contacts,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat daftar kontak.',
      error: error.message,
    });
  }
};

/**
 * POST /api/contacts
 * Create a single contact
 */
export const createContact = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const { name, phone, email, tags = [], customFields = {}, listId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan nomor telepon wajib diisi.',
      });
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 9) {
      return res.status(400).json({
        success: false,
        message: 'Format nomor WhatsApp tidak valid.',
      });
    }

    // Check plan limits
    if (req.user.role !== 'SUPER_ADMIN' && req.workspace) {
      const subscription = await prisma.subscription.findUnique({
        where: { workspaceId },
        include: { plan: true },
      });

      if (subscription?.plan) {
        const count = await prisma.contact.count({ where: { workspaceId } });
        if (count >= subscription.plan.maxContacts) {
          return res.status(403).json({
            success: false,
            message: `Limit kontak untuk paket ${subscription.plan.name} (${subscription.plan.maxContacts} kontak) telah tercapai. Silakan upgrade paket.`,
          });
        }
      }
    }

    // Upsert contact
    const contact = await prisma.contact.upsert({
      where: {
        workspaceId_phone: {
          workspaceId,
          phone: cleanPhone,
        },
      },
      update: {
        name: name.trim(),
        email: email?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        customFields: typeof customFields === 'object' ? customFields : {},
      },
      create: {
        workspaceId,
        name: name.trim(),
        phone: cleanPhone,
        email: email?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        customFields: typeof customFields === 'object' ? customFields : {},
      },
    });

    // Link to list if provided
    if (listId) {
      await prisma.contactListRelation.upsert({
        where: {
          contactId_listId: {
            contactId: contact.id,
            listId,
          },
        },
        update: {},
        create: {
          contactId: contact.id,
          listId,
        },
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: `Kontak ${contact.name} (${contact.phone}) berhasil disimpan.`,
      data: { contact },
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kontak baru.',
      error: error.message,
    });
  }
};

/**
 * POST /api/contacts/import
 * Bulk import contacts from CSV/Excel JSON
 */
export const importContacts = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const { contacts = [], listName, listId } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Daftar kontak kosong atau format tidak sesuai.',
      });
    }

    // Check plan limits
    if (req.user.role !== 'SUPER_ADMIN' && req.workspace) {
      const subscription = await prisma.subscription.findUnique({
        where: { workspaceId },
        include: { plan: true },
      });

      if (subscription?.plan) {
        const currentCount = await prisma.contact.count({ where: { workspaceId } });
        if (currentCount + contacts.length > subscription.plan.maxContacts) {
          return res.status(403).json({
            success: false,
            message: `Jumlah kontak melebihi kuota paket Anda. Sisa kuota: ${Math.max(0, subscription.plan.maxContacts - currentCount)} kontak.`,
          });
        }
      }
    }

    // Resolve or create list if requested
    let targetListId = listId;
    if (!targetListId && listName?.trim()) {
      const newList = await prisma.contactList.create({
        data: {
          workspaceId,
          name: listName.trim(),
          description: `Import pada ${new Date().toLocaleDateString('id-ID')}`,
        },
      });
      targetListId = newList.id;
    }

    let successCount = 0;
    let duplicateCount = 0;

    for (const item of contacts) {
      if (!item.phone) continue;
      const cleanPhone = normalizePhone(item.phone);
      if (!cleanPhone || cleanPhone.length < 9) continue;

      const name = item.name?.trim() || `Kontak ${cleanPhone.slice(-4)}`;
      const email = item.email?.trim() || null;
      const tags = Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === 'string'
        ? item.tags.split(',').map((t) => t.trim())
        : [];

      try {
        const contact = await prisma.contact.upsert({
          where: {
            workspaceId_phone: {
              workspaceId,
              phone: cleanPhone,
            },
          },
          update: {
            name,
            email,
            tags,
            customFields: item.customFields || {},
          },
          create: {
            workspaceId,
            name,
            phone: cleanPhone,
            email,
            tags,
            customFields: item.customFields || {},
          },
        });

        if (targetListId) {
          await prisma.contactListRelation.upsert({
            where: {
              contactId_listId: {
                contactId: contact.id,
                listId: targetListId,
              },
            },
            update: {},
            create: {
              contactId: contact.id,
              listId: targetListId,
            },
          });
        }

        successCount++;
      } catch (err) {
        duplicateCount++;
      }
    }

    return res.json({
      success: true,
      message: `Import selesai: ${successCount} kontak berhasil diproses.`,
      data: {
        totalProcessed: contacts.length,
        successCount,
        targetListId,
      },
    });
  } catch (error) {
    console.error('Error importing contacts:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengimpor data kontak.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/contacts/:id
 */
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?.id;

    await prisma.contact.deleteMany({
      where: { id, ...(req.user.role === 'SUPER_ADMIN' ? {} : { workspaceId }) },
    });

    return res.json({
      success: true,
      message: 'Kontak berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kontak.',
    });
  }
};

/**
 * GET /api/contacts/lists
 */
export const getContactLists = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const where = isSuperAdmin && !req.query.workspaceOnly ? {} : { workspaceId };

    const lists = await prisma.contactList.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    });

    return res.json({
      success: true,
      data: { lists },
    });
  } catch (error) {
    console.error('Error fetching contact lists:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat grup kontak.',
    });
  }
};

/**
 * POST /api/contacts/lists
 */
export const createContactList = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama grup kontak/list wajib diisi.',
      });
    }

    const list = await prisma.contactList.create({
      data: {
        workspaceId,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Grup kontak ${list.name} berhasil dibuat.`,
      data: { list },
    });
  } catch (error) {
    console.error('Error creating contact list:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat grup kontak.',
    });
  }
};
