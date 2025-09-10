// controllers/excelController.js
import Appointment from '../models/Appointment.js';
import fs from 'fs'; 
import ExcelJS from 'exceljs';
import { findOrCreateClient, formatDate, combineDateTime, formatTime } from '../helpers/index.js';
import Rescheduled from '../models/Rescheduled.js';

// Export appointments to Excel file
export const exportAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('client').lean();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Appointments');

        // Define columns
        worksheet.columns = [
            { header: 'Client Name', key: 'clientName' },
            { header: 'Client Age', key: 'clientAge' },
            { header: 'Client Gender', key: 'clientGender' },
            { header: 'Client Contact', key: 'clientContact' },
            { header: 'Client Address', key: 'clientAddress' },
            { header: 'Appointment Date', key: 'appointmentDate' },
            { header: 'Start Time', key: 'startTime' },
            { header: 'End Time', key: 'endTime' },
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
            clientGender:appt.client ? appt.client.gender : 'N/A',
            clientAddress:appt.client ? appt.client.address : 'N/A',
            appointmentDate: formatDate(appt.start),
            startTime: formatTime(appt.start),
            endTime: formatTime(appt.end),
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

// Import appointments from Excel file
export const importAppointments = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }
        
        const filePath = req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1); // Get the first worksheet

        if (!worksheet) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: 'Excel file is empty or has no worksheets.' });
        }

        const jsonData = [];
        const headerRow = worksheet.getRow(1).values; // Get header row to map columns

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
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
                // Find or create the client based on the "Client Name" column
                const clientName = row['Client Name'];
                const clientAge = row['Client Age'];
                const clientGender = row['Client Gender'];
                const clientContact =row['Client Contact'];
                const clientAddress =row['Client Address'];
                client_data={
                    name:clientName,
                    age:clientAge,
                    gender:clientGender,
                    contact:clientContact,
                    address:clientAddress

                }
                const clientId = await findOrCreateClient(client_data);
                // Create the start and end Date objects
                const startDateTime = combineDateTime(row['Appointment Date'], row['Start Time']);
                const endDateTime = combineDateTime(row['Appointment Date'], row['End Time']);

                if (!startDateTime || !endDateTime) {
                    errors.push({ row: row, error: "Invalid date or time format" });
                    continue;
                }

                // Check for existing appointment
                const checkAppointment = await Appointment.findOne({
                    client: clientId,
                    start: startDateTime,
                    end: endDateTime,
                });

                if (!checkAppointment) {
                    const newAppointment = new Appointment({
                        client: clientId,
                        start: startDateTime,
                        end: endDateTime,
                        platform: row['Platform'],
                        type: row['Type'],
                        status: row['Status'] || 'scheduled',
                        notes: row['Notes'],
                    });

                    const savedAppointment = await newAppointment.save();
                    importedAppointments.push(savedAppointment);
                    console.log(`Appointment saved: ${clientName} on ${row['Appointment Date']} at ${row['Start Time']}.`);
                } else {
                    console.log(`Appointment for client ${clientName} on ${row['Appointment Date']} at ${row['Start Time']} is already present.`);
                }
            } catch (error) {
                errors.push({ row: row, error: error.message });
                console.error('Error importing row:', row, error);
            }
        }

        fs.unlinkSync(filePath);

        if (errors.length > 0) {
            return res.status(207).json({
                success: true,
                message: `${importedAppointments.length} appointments imported successfully. ${errors.length} rows failed to import.`,
                imported: importedAppointments,
                errors: errors
            });
        }

        res.status(200).json({
            success: true,
            message: `${importedAppointments.length} appointments imported successfully.`,
            imported: importedAppointments,
        });

    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};



// Export reschedules to Excel file
export const exportReschedules = async (req, res) => {
    try {
        // Populate both 'client' and 'appointment' references
        const reschedules = await Rescheduled.find()
            .populate('client', 'name age contact gender')
            .populate('appointment', 'start end platform type status')
            .lean();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reschedules');

        // Define columns
        worksheet.columns = [
            { header: 'Client Name', key: 'clientName' },
            { header: 'Client Age', key: 'clientAge' },
            { header: 'Client Gender', key: 'clientGender' },
            { header: 'Client Contact', key: 'clientContact' },
            { header: 'Client Address', key: 'clientAddress' },
            { header: 'Appointment Date', key: 'appointmentDate' },
            { header: 'Start Time', key: 'startTime' },
            { header: 'End Time', key: 'endTime' },
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
            clientGender:appt.client ? appt.client.gender : 'N/A',
            clientAddress:appt.client ? appt.client.address : 'N/A',
            appointmentDate: formatDate(appt.start),
            startTime: formatTime(appt.start),
            endTime: formatTime(appt.end),
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
            'attachment; filename=' + 'reschedules.xlsx'
        );
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting reschedules:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// Import reschedules from Excel file
export const importReschedules = async (req, res) => {
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
            return res.status(400).json({ success: false, message: 'Excel file is empty or has no worksheets.' });
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

        const importedReschedules = [];
        const errors = [];

        for (const row of jsonData) {
            try {
                // Step 1: Find or create client
                const clientName = row['Client Name'];
                const clientAge = row['Client Age'];
                const clientGender = row['Client Gender'];
                const clientContact =row['Client Contact'];
                const clientAddress =row['Client Address'];
                client_data={
                    name:clientName,
                    age:clientAge,
                    gender:clientGender,
                    contact:clientContact,
                    address:clientAddress

                }
                const clientId = await findOrCreateClient(client_data);

                if (!clientId) {
                    errors.push({ row, error: "Client name is required to find or create client." });
                    continue;
                }

                // Step 2: Parse RESCHEDULED END time → infer START by subtracting 1 hour (assume 1-hour slot)
                const rescheduledDateStr = row['Rescheduled Start'];
                const rescheduledEndTimeStr = row['Rescheduled End'];
                const rescheduledEnd = combineDateTime(rescheduledDateStr, rescheduledEndTimeStr);

                if (!rescheduledEnd) {
                    errors.push({ row, error: "Invalid rescheduled date/time format. Ensure 'Rescheduled Start' is DD/MM/YYYY and 'Rescheduled End' is like '11:00 AM'." });
                    continue;
                }

                const rescheduledStart = new Date(rescheduledEnd);
                rescheduledStart.setHours(rescheduledStart.getHours() - 1); // 1-hour appointment

                // Step 3: FIND APPOINTMENT using inferred rescheduled start/end
                let appointment = await Appointment.findOne({
                    client: clientId,
                    start: { $gte: rescheduledStart, $lt: new Date(rescheduledStart.getTime() + 60000) },
                    end: { $gte: rescheduledEnd, $lt: new Date(rescheduledEnd.getTime() + 60000) },
                });

                if (!appointment) {
                    errors.push({
                        row,
                        error: `No appointment found for client "${clientName}" with time slot ${formatTime(rescheduledStart)} - ${formatTime(rescheduledEnd)} on ${formatDate(rescheduledStart)}.`
                    });
                    continue;
                }

                // Step 4: Parse ORIGINAL END time → infer START by subtracting 1 hour
                const originalDateStr = row['Original Start'];
                const originalEndTimeStr = row['Original End'];
                const originalEnd = combineDateTime(originalDateStr, originalEndTimeStr);

                if (!originalEnd) {
                    errors.push({ row, error: "Invalid original date/time format. Ensure 'Original Start' is DD/MM/YYYY and 'Original End' is like '11:00 AM'." });
                    continue;
                }

                const originalStart = new Date(originalEnd);
                originalStart.setHours(originalStart.getHours() - 1);

                // Step 5: Check for duplicate Reschedule record
                const existingReschedule = await Rescheduled.findOne({
                    client: clientId,
                    appointment: appointment._id,
                    'preschedule.start': { $gte: originalStart, $lt: new Date(originalStart.getTime() + 60000) },
                    'preschedule.end': { $gte: originalEnd, $lt: new Date(originalEnd.getTime() + 60000) },
                    'reschedule.start': { $gte: rescheduledStart, $lt: new Date(rescheduledStart.getTime() + 60000) },
                    'reschedule.end': { $gte: rescheduledEnd, $lt: new Date(rescheduledEnd.getTime() + 60000) },
                });

                if (existingReschedule) {
                    console.log(`🔁 Reschedule already exists for client ${clientName}. Skipping.`);
                    continue;
                }

                // Step 6: Create Reschedule record
                const newReschedule = new Rescheduled({
                    client: clientId,
                    appointment: appointment._id,
                    preschedule: {
                        start: originalStart,
                        end: originalEnd,
                    },
                    reschedule: {
                        start: rescheduledStart,
                        end: rescheduledEnd,
                    },
                    scheduleBy: row['Scheduled By'] || 'system',
                });

                const savedReschedule = await newReschedule.save();
                importedReschedules.push(savedReschedule);
                console.log(`✅ Reschedule record created for client: ${clientName} | ${formatDate(rescheduledStart)} ${formatTime(rescheduledStart)} - ${formatTime(rescheduledEnd)}`);

            } catch (error) {
                errors.push({ row, error: error.message });
                console.error('❌ Row processing error:', row, error);
            }
        }

        // Cleanup uploaded file
        fs.unlinkSync(filePath);

        if (errors.length > 0) {
            return res.status(207).json({
                success: true,
                message: `${importedReschedules.length} reschedules imported successfully. ${errors.length} rows failed.`,
                imported: importedReschedules,
                errors: errors
            });
        }

        res.status(200).json({
            success: true,
            message: `${importedReschedules.length} reschedules imported successfully.`,
            imported: importedReschedules,
        });

    } catch (error) {
        console.error('💥 Server error during reschedule import:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};