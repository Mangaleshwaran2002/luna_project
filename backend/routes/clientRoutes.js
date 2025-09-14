import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';

const router = express.Router();

// ✅ CREATE
router.post('/', createClient);

// ✅ READ ALL
router.get('/', getClients);

// ✅ READ ONE
router.get('/:id', getClientById);

// ✅ UPDATE
router.put('/:id', updateClient);

// ✅ DELETE
router.delete('/:id', deleteClient);

export default router;