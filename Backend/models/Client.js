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
    default:'male',
    trim: true,
  },
  contact: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'],
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
    // Normalize the name: filter special characters and replace spaces with underscores
    let tempName = this.name.toLowerCase();
    tempName = tempName.replace(/[^a-zA-Z0-9\s]/g, ''); // Filter special characters, allowing spaces
    tempName = tempName.replace(/\s+/g, '_'); // Replace one or more spaces with a single underscore
    this.normalizedName = tempName;
  }
  next();
});

export default mongoose.model('Client', clientSchema);
