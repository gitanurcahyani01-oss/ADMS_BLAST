import express from 'express';
import {
  getContacts,
  createContact,
  importContacts,
  deleteContact,
  getContactLists,
  createContactList,
} from '../controllers/contactController.js';
import { verifyToken, requirePermission, requireWorkspace } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// Contact lists / segments
router.get('/lists', requirePermission('lists.view'), getContactLists);
router.post('/lists', requirePermission('lists.create'), requireWorkspace, createContactList);

// Contacts CRUD & Import
router.get('/', requirePermission('contacts.view'), getContacts);
router.post('/', requirePermission('contacts.create'), requireWorkspace, createContact);
router.post('/import', requirePermission('contacts.import'), requireWorkspace, importContacts);
router.delete('/:id', requirePermission('contacts.delete'), deleteContact);

export default router;
