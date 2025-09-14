// controllers/excelController.js
import Appointment from '../models/Appointment.js';
import fs from 'fs'; 
import ExcelJS from 'exceljs';
import { findOrCreateClient, 
    formatDate, 
    combineDateTime,
    parseDateOnly,
    formatTime } from '../helpers/index.js';
import Rescheduled from '../models/Rescheduled.js';

// Export appointments to Excel file
export const exportAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('client').lean();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Appointments');

        // Define columns - Added 'Category' and 'Sub-Category'
        worksheet.columns = [
            { header: 'Client Name', key: 'clientName' },
            { header: 'Client Age', key: 'clientAge' },
            { header: 'Client Gender', key: 'clientGender' },
            { header: 'Client Contact', key: 'clientContact' },
            { header: 'Client Address', key: 'clientAddress' },
            { header: 'Appointment Date', key: 'appointmentDate' },
            { header: 'Start Time', key: 'startTime' },
            { header: 'End Time', key: 'endTime' },
            { header: 'Category', key: 'category' },
            { header: 'Sub-Category', key: 'subCategory' },
            { header: 'Platform', key: 'platform' },
            { header: 'Type', key: 'type' },
            { header: 'Status', key: 'status' },
            { header: 'Notes', key: 'notes' },
        ];

        // Add data
        const data = appointments.map(appt => ({
            clientName: appt.client ? appt.client.name : 'N/A',
            clientAge: appt.client ? appt.client.age : 'N/A',
            clientContact: appt.client ? appt.client.contact : 'N/A',
            clientGender: appt.client ? appt.client.gender : 'N/A',
            clientAddress: appt.client ? appt.client.address : 'N/A',
            appointmentDate: formatDate(appt.start),
            startTime: formatTime(appt.start),
            endTime: formatTime(appt.end),
            category: appt.category || '', // Use empty string if undefined/null
            subCategory: appt.sub_category || '', // Use empty string if undefined/null
            platform: appt.platform,
            type: appt.type,
            status: appt.status,
            notes: appt.notes,
        }));
        worksheet.addRows(data);

        // Send the file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'appointments.xlsx'
        );
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Excel Template file
export const downloadTemplate = (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments');

    worksheet.columns = [
        { header: 'Client Name', key: 'clientName' },
        { header: 'Client Age', key: 'clientAge' },
        { header: 'Client Gender', key: 'clientGender' },
        { header: 'Client Contact', key: 'clientContact' },
        { header: 'Client Address', key: 'clientAddress' },
        { header: 'Appointment Date', key: 'appointmentDate' },
        { header: 'Start Time', key: 'startTime' },
        { header: 'End Time', key: 'endTime' },
        { header: 'Category', key: 'category' },
        { header: 'Sub-Category', key: 'subCategory' },
        { header: 'Platform', key: 'platform' },
        { header: 'Type', key: 'type' },
        { header: 'Status', key: 'status' },
        { header: 'Notes', key: 'notes' },
    ];

    // Add sample row
    worksheet.addRow({
        clientName: 'Jane Smith',
        clientAge: 32,
        clientGender: 'female',
        clientContact: '+123456789',
        clientAddress: '456 Oak Ave',
        appointmentDate: '2025-04-15',
        startTime: '14:00',
        endTime: '15:00',
        category: 'Consultation',
        subCategory: 'Follow-up',
        platform: 'website',
        type: 'consultation',
        status: 'scheduled',
        notes: 'Sample entry'
    });

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=appointments-template.xlsx'
    );

    workbook.xlsx.write(res).then(() => res.end());
};

// Import appointments from Excel file
export const importAppointments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no worksheets.',
      });
    }

    const jsonData = [];
    const headerRow = worksheet.getRow(1).values;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headerRow[colNumber];
          if (header) {
            rowData[header] = cell.value;
          }
        });
        jsonData.push(rowData);
      }
    });

    if (jsonData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Excel file is empty.' });
    }

    const importedAppointments = [];
    const errors = [];

    for (const row of jsonData) {
      try {
        // Extract client data
        const clientName = row['Client Name'];
        const clientAge = row['Client Age'];
        const clientGender = row['Client Gender'];
        const clientContact = row['Client Contact'];
        const clientAddress = row['Client Address'];

        if (!clientName) {
          errors.push({
            row,
            error: 'Missing required client information (Name or Contact)',
          });
          continue;
        }

        const client_data = {
          name: clientName,
          age: clientAge,
          gender: clientGender,
          contact: clientContact,
          address: clientAddress,
        };

        const clientId = await findOrCreateClient(client_data);
        if (!clientId) {
          errors.push({ row, error: 'Failed to create or find client' });
          continue;
        }

        // Parse appointment date and times
        const startDateTime = combineDateTime(row['Appointment Date'], row['Start Time']);
        const endDateTime = combineDateTime(row['Appointment Date'], row['End Time']);

        if (!startDateTime) {
          errors.push({
            row,
            error: `Invalid Start DateTime: Date='${row['Appointment Date']}', Time='${row['Start Time']}'`,
          });
          continue;
        }

        if (!endDateTime) {
          errors.push({
            row,
            error: `Invalid End DateTime: Date='${row['Appointment Date']}', Time='${row['End Time']}'`,
          });
          continue;
        }

        // Parse appointmentDate (date-only)
        const appointmentDate = parseDateOnly(row['Appointment Date']);
        if (!appointmentDate) {
          errors.push({ row, error: `Invalid Appointment Date format: ${row['Appointment Date']}` });
          continue;
        }

        // Check for duplicate appointment (same client + same start time)
        const existingAppointment = await Appointment.findOne({
          client: clientId,
          start: startDateTime,
        });

        if (existingAppointment) {
          console.log(
            `Duplicate skipped: ${clientName} at ${row['Start Time']} on ${row['Appointment Date']}`
          );
          continue;
        }

        // Create new appointment
        const newAppointment = new Appointment({
          client: clientId,
          start: startDateTime,
          end: endDateTime,
          appointmentDate: appointmentDate,
          platform: row['Platform'],
          type: row['Type'],
          status: row['Status'] || 'scheduled',
          notes: row['Notes'],
          category: row['Category'] || '',
          sub_category: row['Sub-Category'] || '',
        });

        const savedAppointment = await newAppointment.save();
        importedAppointments.push(savedAppointment);
        console.log(`Appointment saved: ${clientName} on ${row['Appointment Date']} at ${row['Start Time']}`);
      } catch (error) {
        errors.push({ row, error: error.message });
        console.error('Error importing row:', row, error);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Respond with results
    if (errors.length > 0) {
      return res.status(207).json({
        success: true,
        message: `${importedAppointments.length} appointments imported successfully. ${errors.length} rows failed.`,
        imported: importedAppointments,
        errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${importedAppointments.length} appointments imported successfully.`,
      imported: importedAppointments,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during import',
      error: error.message,
    });
  }
};
