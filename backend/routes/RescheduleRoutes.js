
import express from 'express';
import {
    getReschedules,
    getRescheduleById,
    deleteReschedule
} from '../controllers/rescheduleController.js';
import { 
    exportReschedule,
     importReschedule
     } from '../controllers/excelController.js';
import { upload } from '../server.js'; 
const router = express.Router();


// ✅ Excel Import/Export routes — SPECIFIC, put first


// ✅ CRUD routes — put DYNAMIC routes (with :id) LAST
router.get('/', getReschedules);
router.get('/export', exportReschedule);
router.post('/import', upload.single('file'), importReschedule);
router.get('/:id', getRescheduleById);
router.delete('/:id', deleteReschedule);

export default router;