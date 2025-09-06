import mongoose from 'mongoose';

const rescheduleSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  preschedule: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  reschedule: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  scheduleBy: {
    type: String,
    required: true
  },
}, {
  timestamps: true,
});

export default mongoose.model('Reschedule', rescheduleSchema);
