// models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  start: {
    type: Date,
    unique: true,
  },
  end: {
    type: Date,
    unique: true,
  },
  platform: {
    type: String,
    enum: ['website', 'phone', 'in-person', 'whatsapp', 'instagram'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'treatment'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Appointment', appointmentSchema);
