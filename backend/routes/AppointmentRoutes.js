import express from 'express';
import { upload } from '../server.js'; // Use ES module import syntax and include .js extension
import {
  createAppointment,
  getAppointments,
  getAppointmentsbyId,
  deleteAppointmentsbyId,
  getAppointmentsByMonthAndYear,
  getAppointmentsByDate,
  updateAppointment
} from '../controllers/appointmentController.js'; // Use ES module import syntax and include .js extension
import { importAppointments, exportAppointments,downloadTemplate } from '../controllers/excelController.js'; // Use ES module import syntax and include .js extension
const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);

router.post('/import', upload.single('file'), importAppointments);
router.get('/export', exportAppointments);
router.get('/template', downloadTemplate);
router.get('/filter-by-date', getAppointmentsByDate);
router.get('/filter', getAppointmentsByMonthAndYear);

router.get('/:id', getAppointmentsbyId);
router.delete('/:id', deleteAppointmentsbyId);
router.put('/:id', updateAppointment);



export default router; // Use ES module export syntax
