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
export interface ApiAppointment {
  _id: string;
  client: Client;
  appointmentDate: string;
  start: string;
  end: string;
  platform: "website" | "phone" | "in-person" | "whatsapp" | "instagram";
  type: "consultation" | "treatment" | "maintenance" | "";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  category?: string; // 👈 Added
  sub_category?: string; // 👈 Added
}

export interface Appointment {
  _id: string;
  client: Client;
  appointmentDate: string;
  start: string;
  end: string;
  platform: "website" | "phone" | "in-person" | "whatsapp" | "instagram";
  type: "consultation" | "treatment" | "maintenance" | "";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string;
  createdAt: string;
  updatedAt: string;
  category?: string; // 👈 Added
  sub_category?: string; // 👈 Added
}
export type AppointmentData = {
  client: {
    name: string;
    age: number | '';
    gender: "male" | "female";
    contact: string;
    address: string;
  };
  start: string;
  end: string;
  platform?: "website" | "phone" | "in-person" | "whatsapp" | "instagram";
  type?: "consultation" | "treatment" | "maintenance" | "";
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  category?: string; // 👈 Added
  sub_category?: string; // 👈 Added
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
}
