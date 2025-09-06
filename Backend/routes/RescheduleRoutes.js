
import express from 'express';
import {
    getReschedules,
    getRescheduleById,
    deleteReschedule
} from '../controllers/rescheduleController.js';

import {
    exportReschedules,
    importReschedules
} from '../controllers/excelController.js';

import { upload } from '../server.js'; // Use ES module import syntax and include .js extension

const router = express.Router();


// ✅ Excel Import/Export routes — SPECIFIC, put first
router.get('/export', exportReschedules);
router.post('/import', upload.single('file'), importReschedules);

// ✅ CRUD routes — put DYNAMIC routes (with :id) LAST
router.get('/', getReschedules);
router.get('/:id', getRescheduleById);
router.delete('/:id', deleteReschedule);


export default router;