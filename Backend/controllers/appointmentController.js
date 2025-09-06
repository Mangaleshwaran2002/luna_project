// backend/controllers/appointmentController.js
import Appointment from '../models/Appointment.js'; // Use ESM import and add .js extension
import mongoose from 'mongoose'; // Use ESM import
import { findOrCreateClient } from '../helpers/index.js'; // Use ESM import and add .js extension
import { auth } from '../lib/auth.js';

// Create a new appointment with client
export const createAppointment = async (req, res) => {
  try {
    const { client, ...appointmentData } = req.body;

    const clientDoc = await findOrCreateClient(client.name, client.age);
    if (!clientDoc) {
      return res.status(400).json({
        success: false,
        message: 'Client data is missing or invalid.',
      });
    }

    const appointment = await Appointment.create({
      ...appointmentData,
      client: clientDoc._id,
    });

    const populatedAppointment = await Appointment.findById(appointment._id).populate('client');

    const appointmentDate = new Date(appointment.start).toISOString().split('T')[0]; // YYYY-MM-DD
    const monthYear = appointmentDate.slice(0, 7); // e.g., "2025-09"
    console.log(`\n\nappointmentDate : ${appointmentDate} \n\n monthYear: ${monthYear}\n\n`);

    // Emit to both daily and monthly rooms
    if (global.io) {
      global.io.to(`appointments:${appointmentDate}`).emit('appointment:created', populatedAppointment);
      global.io.to(`appointments:${monthYear}`).emit('appointment:created', populatedAppointment);
    }

    res.status(201).json({
      success: true,
      data: populatedAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all appointments (with client details and computed date)
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.aggregate([
      // Stage 1: Populate the client details.
      {
        $lookup: {
          from: 'clients', // The name of the Client collection (MongoDB pluralizes it automatically)
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      // Stage 2: Deconstruct the client array and flatten the details.
      {
        $unwind: '$client',
      },
      // Stage 3: Add the new appointmentDate field.
      {
        $addFields: {
          // Extract year, month, and day from the start date, then reconstruct as a new date.
          appointmentDate: {
            $dateFromParts: {
              year: { $year: '$start' },
              month: { $month: '$start' },
              day: { $dayOfMonth: '$start' },
            },
          },
        },
      },
      // Stage 4: Reshape the document to specify which fields to include.
      {
        $project: {
          _id: 1,
          client: {
            _id: '$client._id',
            name: '$client.name',
            age: '$client.age',
            gender: '$client.gender',
          },
          appointmentDate: 1, // Include the newly created field.
          start: 1,
          end: 1,
          platform: 1,
          type: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
///////////////////////////////////////////////////////////////////

// Get appointment by ID
export const getAppointmentsbyId = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Use aggregate to find the appointment, populate the client, and add the computed date
    const appointment = await Appointment.aggregate([
      // Stage 1: Match the document by ID.
      {
        $match: {
          _id: new mongoose.Types.ObjectId(appointmentId), // Convert the string ID to a MongoDB ObjectId
        },
      },
      // Stage 2: Populate the client details.
      {
        $lookup: {
          from: 'clients', // The name of the Client collection
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      // Stage 3: Deconstruct the client array.
      {
        $unwind: '$client',
      },
      // Stage 4: Add the new appointmentDate field.
      {
        $addFields: {
          appointmentDate: {
            $dateFromParts: {
              year: { $year: '$start' },
              month: { $month: '$start' },
              day: { $dayOfMonth: '$start' },
            },
          },
        },
      },
      // Stage 5: Reshape the document.
      {
        $project: {
          _id: 1,
          client: {
            _id: '$client._id',
            name: '$client.name',
            age: '$client.age',
            gender: '$client.gender',
          },
          appointmentDate: 1,
          start: 1,
          end: 1,
          platform: 1,
          type: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    // Check if an appointment was found. The aggregate method returns an array.
    if (!appointment || appointment.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      appointment: appointment[0], // Return the first (and only) document from the result array.
    });
  } catch (error) {
    console.error('Error getting appointment by ID:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
///////////////////////////////////////////////////////////////////
// Delete appointment by ID


export const deleteAppointmentsbyId = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Extract the date from the appointment's start time before deletion
    const appointmentDate = new Date(appointment.start).toISOString().split('T')[0]; // YYYY-MM-DD

    // Now delete the appointment
    await Appointment.findByIdAndDelete(req.params.id);

    // Emit real-time delete event to the date-specific room
    if (global.io) {
      global.io.to(`appointments:${appointmentDate}`).emit('appointment:deleted', {
        _id: appointment._id,
      });
    }

    res.status(200).json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/////////////////////////////////////////////////////////////////////////





// Filter by date
export const getAppointmentsByDate = async (req, res) => {
  // Extract the date from the query parameters (e.g., /appointments?date=YYYY-MM-DD)
  const targetDateStr = req.query.date;

  // Validate the date format
  if (!targetDateStr) {
    return res.status(400).json({ message: 'Date query parameter is required.' });
  }
  
  const targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
  }

  // Set the start and end of the day to define the date range for the query
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  try {
    const appointments = await Appointment.aggregate([
      // Stage 1: Match appointments within the specified date range.
      {
        $match: {
          start: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      // Stage 2: Populate the client details, just like in getAppointments.
      {
        $lookup: {
          from: 'clients', // The name of the Client collection
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      // Stage 3: Deconstruct the client array.
      {
        $unwind: '$client',
      },
      // Stage 4: Add the new appointmentDate field.
      {
        $addFields: {
          appointmentDate: {
            $dateFromParts: {
              year: { $year: '$start' },
              month: { $month: '$start' },
              day: { $dayOfMonth: '$start' },
            },
          },
        },
      },
      // Stage 5: Reshape the document.
      {
        $project: {
          _id: 1,
          client: {
            _id: '$client._id',
            name: '$client.name',
            age: '$client.age',
            gender: '$client.gender',
          },
          appointmentDate: 1,
          start: 1,
          end: 1,
          platform: 1,
          type: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// Filter By Month And Year
export const getAppointmentsByMonthAndYear = async (req, res) => {
  // Extract month and year from query parameters (e.g., /appointments/monthly?year=2025&month=7)
  const { year, month } = req.query;

  // Input validation: ensure year and month are provided and are valid numbers
  if (!year || !month) {
    return res.status(400).json({ message: 'Both year and month query parameters are required.' });
  }
  const yearInt = parseInt(year, 10);
  const monthInt = parseInt(month, 10);
  if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
    return res.status(400).json({ message: 'Invalid year or month value.' });
  }

  // Create Date objects for the start and end of the month
  const startDate = new Date(yearInt, monthInt - 1, 1); // JS months are 0-indexed
  const endDate = new Date(yearInt, monthInt, 1);      // First day of the *next* month

  try {
    const appointments = await Appointment.aggregate([
      // Stage 1: Match appointments within the specified month and year range.
      {
        $match: {
          start: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      // Stage 2: Populate the client details.
      {
        $lookup: {
          from: 'clients', // The name of the Client collection
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      // Stage 3: Deconstruct the client array and flatten the details.
      {
        $unwind: '$client',
      },
      // Stage 4: Add the new appointmentDate field.
      {
        $addFields: {
          appointmentDate: {
            $dateFromParts: {
              year: { $year: '$start' },
              month: { $month: '$start' },
              day: { $dayOfMonth: '$start' },
            },
          },
        },
      },
      // Stage 5: Reshape the document to specify which fields to include.
      {
        $project: {
          _id: 1,
          client: {
            _id: '$client._id',
            name: '$client.name',
            age: '$client.age',
            gender: '$client.gender',
          },
          appointmentDate: 1, // Include the newly created field.
          start: 1,
          end: 1,
          platform: 1,
          type: 1,
          status: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update appointment

import Reschedule from '../models/Rescheduled.js';
// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const { status, start, end, platform, type ,scheduleBy } = req.body;
    if(scheduleBy){
      console.log(`\n\n\n${scheduleBy}\n\n\n`)
    }
    const updateFields = {};
    let isReschedule = false;
    if (status !== undefined) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      updateFields.status = status;
    }
    // Validate new date values

    if (start !== undefined) {
        updateFields.start = new Date(start);
        if (isNaN(updateFields.start)) {
          return res.status(400).json({ success: false, message: 'Invalid start date' });
        }
    } else {
        // If only end is updated, use original start
        updateFields.start = originalAppointment.start;
    }

    if (end !== undefined) {
        updateFields.end = new Date(end);
        if (isNaN(updateFields.end)) {
          return res.status(400).json({ success: false, message: 'Invalid end date' });
        }
    } else {
        // If only start is updated, use original end
        updateFields.end = originalAppointment.end;
    }

    // Validate time range
    if (updateFields.start >= updateFields.end) {
        return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }

    // Check if start or end dates are being updated
    if (start !== undefined || end !== undefined) {
      isReschedule = true;
      updateFields.status = 'rescheduled';

      // Find the original appointment to get pre-schedule details
      const originalAppointment = await Appointment.findById(id);

      if (!originalAppointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Prepare reschedule data
      const rescheduleData = {
        client: originalAppointment.client,
        appointment: originalAppointment._id,
        preschedule: {
          start: originalAppointment.start,
          end: originalAppointment.end,
        },
        reschedule: {
          start: new Date(start) || originalAppointment.start,
          end: new Date(end) || originalAppointment.end,
        },
        // scheduleBy : 'user', // Added `scheduleBy` for clarity. It's a required field in your `rescheduleSchema`.
        scheduleBy : scheduleBy
      };


      // Create a new Reschedule entry
      await Reschedule.create(rescheduleData);

      // Set appointment status to 'rescheduled'
      
    }



    if (platform !== undefined) {
      const validPlatforms = ['website', 'phone', 'in-person', 'whatsapp', 'instagram'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ success: false, message: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` });
      }
      updateFields.platform = platform.trim();
    }

    if (type !== undefined) {
      const validTypes = ['consultation', 'follow-up', 'treatment'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      }
      updateFields.type = type.trim();
    }

    // Find and update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointmentDate = new Date(updatedAppointment.start).toISOString().split('T')[0];
    const monthYear = appointmentDate.slice(0, 7);

    if (global.io) {
      global.io.to(`appointments:${appointmentDate}`).emit('appointment:updated', updatedAppointment);
      global.io.to(`appointments:${monthYear}`).emit('appointment:updated', updatedAppointment);
    }

    res.status(200).json({
      success: true,
      message: isReschedule ? 'Appointment rescheduled successfully' : 'Appointment updated successfully',
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};