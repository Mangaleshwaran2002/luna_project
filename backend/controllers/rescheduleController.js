import Reschedule from '../models/Rescheduled.js';

export const getReschedules = async (req, res) => {
  try {
    const reschedules = await Reschedule.aggregate([
      {
        $lookup: {
          from: 'clients', // The name of the Client collection (MongoDB pluralizes it automatically)
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      {
        $unwind: '$client',
      },
      {
        $project: {
          _id: 1,
          client: {
            _id: '$client._id',
            name: '$client.name',
            age: '$client.age',
            gender: '$client.gender',
          },
          preschedule: {
            start: 1,
            end: 1,
          },
          reschedule: {
            start: 1,
            end: 1,
          },
          scheduleBy: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      count: reschedules.length,
      data: reschedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message,
    });
  }
};

export const getRescheduleById = async (req, res) => {
  try {
    const reschedule = await Reschedule.findById(req.params.id)
      .populate('client', 'name age')
      .exec();

    if (!reschedule) {
      return res.status(404).json({
        success: false,
        error: 'Reschedule record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: reschedule,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message,
    });
  }
};

export const deleteReschedule = async (req, res) => {
  try {
    const reschedule = await Reschedule.findByIdAndDelete(req.params.id);

    if (!reschedule) {
      return res.status(404).json({
        success: false,
        error: 'Reschedule record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message,
    });
  }
};
