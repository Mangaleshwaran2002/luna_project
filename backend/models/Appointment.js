// models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  appointmentDate: {
    type: Date,
    // Set this from start date at creation time
  },
  start: {
    type: Date,
  },
  end: {
    type: Date,
  },
  category:{
    type : String,
    trim: true,
    default : '',
  },
  sub_category:{
    type:String,
    trim: true,
    default : '',
  },
  platform: {
    type: String,
    enum: ['website', 'phone', 'in-person', 'whatsapp', 'instagram'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['consultation', 'treatment','maintenance'],
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
