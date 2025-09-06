import Client from '../models/Client.js';

// Helper function to normalize name
const normalizeName = (name) => {
    if (!name) {
    return '';
  }
  let tempName = name.toLowerCase();
  tempName = tempName.replace(/[^a-zA-Z0-9\s]/g, ''); // Filter special characters, allowing spaces
  tempName = tempName.replace(/\s+/g, '_'); // Replace one or more spaces with a single underscore
  return tempName;
};

// Helper function to find or create a client by name
export const findOrCreateClient = async (clientName,clientAge,clientGender) => {
  if (!clientName && !clientAge) {
    return null;
  }
  const normalizedName = normalizeName(clientName);
  let client = await Client.findOne({ normalizedName });
  if (!client) {
    client = new Client({ name: clientName, age : clientAge, gender : clientGender});
    await client.save();
  }
  return client._id;
};

// Helper function to parse time string (e.g., "10:00 AM")
export const parseTime = (timeString) => {
  if (!timeString) {
    return null;
  }
  const date = new Date(); // Use today's date as a base
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  date.setHours(hours, minutes);
  return date;
};

// Helper function to format time (unchanged)
export const formatTime = (date) => {
  if (!date) {
    return 'N/A';
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format with AM/PM
  });
};

// New helper function to format date
export const formatDate = (date) => {
  if (!date) {
    return 'N/A';
  }
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Function to combine date and time strings into a single Date object
export const combineDateTime = (dateString, timeString) => {
  // Use a reliable parser by creating an ISO-like string
  if (!dateString || !timeString) {
    return null; // Return null if either date or time is missing
  }

  // Assuming dateString is in a format like "DD/MM/YYYY"
  const [day, month, year] = dateString.split('/');
  
  // Create a base date object
  const date = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date

  // Check for AM/PM and convert to 24-hour format
  const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (timeParts) {
    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const ampm = timeParts[3] ? timeParts[3].toLowerCase() : null;

    if (ampm === 'pm' && hours < 12) {
      hours += 12;
    }
    if (ampm === 'am' && hours === 12) {
      hours = 0; // Midnight case
    }
    
    date.setHours(hours, minutes, 0, 0);
  } else {
    return null; // Invalid time format
  }

  return date;
};
