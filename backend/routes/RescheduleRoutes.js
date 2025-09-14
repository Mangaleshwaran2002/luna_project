
import express from 'express';
import {
    getReschedules,
    getRescheduleById,
    deleteReschedule
} from '../controllers/rescheduleController.js';
const router = express.Router();


// ✅ Excel Import/Export routes — SPECIFIC, put first


// ✅ CRUD routes — put DYNAMIC routes (with :id) LAST
router.get('/', getReschedules);
router.get('/:id', getRescheduleById);
router.delete('/:id', deleteReschedule);


export default router;