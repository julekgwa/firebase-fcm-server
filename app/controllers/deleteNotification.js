import schedule from 'node-schedule';
import { ERROR_MSG } from '../helpers/utils.js';

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const current_job = schedule.scheduledJobs[notificationId];

    if (!current_job) {
      throw new Error('Notification not found');
    }

    current_job.cancel();
    res.status(200).json({
      ok: true
    });
  } catch (err) {
    const message = err.message || ERROR_MSG;
    res.status(404);
    res.json({
      message,
    });
  }
};
