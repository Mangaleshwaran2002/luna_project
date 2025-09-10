// models/Appointment.js
import mongoose from 'mongoose';

const treatment =new mongoose.Schema({
    category:{
        type:String
    },
    subcategory:{
        type:String
    }
});


const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  appointmentDate: {                // example value : 10/9/2025
    type: Date,
  },
  start: {                          // example value : 11:00 AM
    type: Date,
    unique: true,
  },
  end: {                            // example value : 01:00 PM
    type: Date,
    unique: true,
  },
  treatment : treatment,
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

// models//Client.js
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  normalizedName: {
    type: String,
    index: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default:'female',
    trim: true,
  },
  contact: {
    type: String,                           // example value : 9024586742 or +9190578493
  },
  address: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

clientSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    let tempName = this.name.toLowerCase();
    tempName = tempName.replace(/[^a-zA-Z0-9\s]/g, ''); // Filter special characters, allowing spaces
    tempName = tempName.replace(/\s+/g, '_'); // Replace one or more spaces with a single underscore
    this.normalizedName = tempName;
  }
  next();
});

export default mongoose.model('Client', clientSchema);

// models//Reschedule.js
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
    appointmentDate: { type: Date, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  reschedule: {
    appointmentDate: { type: Date, required: true },
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
