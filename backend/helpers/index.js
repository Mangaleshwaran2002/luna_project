// helpers/index.js

import Client from '../models/Client.js';

// Helper function to find or create a client by normalized name
export const findOrCreateClient = async (clientData) => {
  if (!clientData || !clientData.name) {
    return null;
  }

  const normalizeName = (name) => {
    let tempName = name.toLowerCase();
    tempName = tempName.replace(/[^a-zA-Z0-9\s]/g, ''); // Filter special characters, allowing spaces
    tempName = tempName.replace(/\s+/g, '_'); // Replace one or more spaces with a single underscore
    return tempName;
  };

  const normalizeClientName = normalizeName(clientData.name);
  let client = await Client.findOne({ normalizedName: normalizeClientName });

  if (!client) {
    client = new Client(clientData);
    await client.save();
  }

  return client;
};

// Helper function to combine date string (YYYY-MM-DD) and time string (HH:mm) into a Date object
// export const combineDateTime = (dateString, timeString) => {
//   if (!dateString || !timeString) {
//     return null;
//   }

//   // Parse date: expect "YYYY-MM-DD"
//   const [year, month, day] = dateString.split('-').map(Number);
//   if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

//   // Parse time: expect "HH:mm" (24-hour format)
//   const [hours, minutes] = timeString.split(':').map(Number);
//   if (isNaN(hours) || isNaN(minutes)) return null;

//   // Validate ranges
//   if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
//     return null;
//   }

//   const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

//   if (isNaN(date.getTime())) {
//     return null;
//   }

//   return date;
// };

/**
 * Parse DD/MM/YYYY string into a Date object (time set to 00:00)
 */
export const parseDateOnly = (dateString) => {
  if (!dateString) return null;

  const match = dateString.toString().trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match.map(Number);

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;

  // Use local timezone to avoid UTC day shift
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Combine DD/MM/YYYY and hh:mm AM/PM into a Date object
 */
export const combineDateTime = (dateString, timeString) => {
  if (!dateString || !timeString) return null;

  // Parse DD/MM/YYYY
  const dateMatch = dateString.toString().trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateMatch) return null;
  const [, day, month, year] = dateMatch.map(Number);

  // Parse hh:mm AM/PM
  const timeMatch = timeString.toString().trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) return null;
  let [, hours, minutes, modifier] = timeMatch;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  // Convert to 24-hour format
  if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  else if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to format date as DD/MM/YYYY (for export display)
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Helper function to format time as HH:mm AM/PM (for export display)
export const formatTime = (date) => {
  if (!date) return 'N/A';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Optional: parseTime is now redundant since we use combineDateTime with HH:mm
// But if you want to support parsing "10:00 AM" for legacy reasons, here's a version:
export const parseTime = (timeString) => {
  if (!timeString) return null;

  const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (hours < 0 || hours > 12 || minutes < 0 || minutes > 59) return null;

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};