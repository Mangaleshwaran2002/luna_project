import Client from '../models/Client.js';
import Appointment from '../models/Appointment.js';
// ✅ CREATE: POST /api/clients
export const createClient = async (req, res) => {
  try {
    const { name, age, gender, contact, address } = req.body;

    if (!name || !age) {
      return res.status(400).json({ message: 'Name and age are required' });
    }

    const client = new Client({
      name,
      age,
      gender: gender || 'female',
      contact,
      address,
    });

    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ READ ALL: GET /api/clients
export const getClients = async (req, res) => {
  try {
    const { name, gender, minAge, maxAge } = req.query;

    let query = {};

    if (name) {
      query.normalizedName = { $regex: name.toLowerCase().replace(/\s+/g, '_'), $options: 'i' };
    }

    if (gender) {
      query.gender = gender;
    }

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ READ ONE: GET /api/clients/:id
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ UPDATE: PUT /api/clients/:id
export const updateClient = async (req, res) => {
  try {
    const { name, age, gender, contact, address } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name,
        age,
        gender,
        contact,
        address,
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(updatedClient);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ DELETE: DELETE /api/clients/:id
export const deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findById(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }
    const deletedAppointments = await Appointment.deleteMany({ client: deletedClient._id });

    await Client.findByIdAndDelete(req.params.id);
    if (global.io) {
      global.io.emit('appointment:deleted');
    }

    res.status(200).json({ message: 'Client deleted successfully', client: deletedClient, appointments: deletedAppointments });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};