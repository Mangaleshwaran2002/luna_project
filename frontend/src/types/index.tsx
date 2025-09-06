export interface NavLink {
  path: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { path: '/', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/profile', label: 'Profile' },
  { path: '/reschedule', label: 'reschedule' },
];


// Represents the client object embedded within the appointment response
export interface Client {
  _id: string; // The ID of the client
  name: string;
  age: number;
  gender: "male" | "female";
}

// Represents the appointment object received from the API
export interface Appointment {
  _id: string; // The ID of the appointment, typically named '_id' by MongoDB
  client: Client; // The nested client object, populated by the API controller
  appointmentDate: string; // Date strings from the API, use Date objects for manipulation in frontend
  start: string; // Combined date and start time string from the API
  end: string; // Combined date and end time string from the API
  platform: "website" | "phone" | "in-person" | "whatsapp" | "instagram";
  type: "consultation" | "follow-up" | "treatment";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
  createdAt: string; // Timestamp from the API
  updatedAt: string; // Timestamp from the API
}


// Define the API response structure to ensure type safety during mapping
export interface ApiAppointment {
  _id: string;
  client: Client;
  appointmentDate: string;
  start: string;
  end: string;
  platform: "website" | "phone" | "in-person" | "whatsapp" | "instagram";
  type: "consultation" | "treatment" | "follow-up";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type AppointmentData = {
  client: {
    name: string;
    age: number | ''; // Use `number | ''` to allow an empty string for the initial state
    gender: "male" | "female";
    contact: string;
    address: string;
  };
  start: string;
  end: string;
  platform: "website" | "phone" | "in-person" | "whatsapp" | "instagram";
  type: "consultation" | "treatment" | "follow-up" | "";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
};


// types.ts
export interface RescheduleRecord {
  _id: string;
  preschedule: {
    start: string;
    end: string;
  };
  reschedule: {
    start: string;
    end: string;
  };
  client: {
    _id: string;
    name: string;
    age: number;
  };
  appointment: string;
  scheduleBy: string;
  createdAt: string;
  updatedAt: string;
  // __v: number;
}
