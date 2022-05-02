import schedule from 'node-schedule';
import { ERROR_MSG } from '../helpers/utils.js';
import { StatusCodes } from 'http-status-codes';

export const deleteNotification = async (req, res) => {

  try {

    const notificationId = req.params.id;

    const currentJob = schedule.scheduledJobs[notificationId];

    if (!currentJob) {

      throw new Error('Notification not found');

    }

    currentJob.cancel();
    res.status(StatusCodes.OK).json({
      ok: true,
    });

  } catch (err) {

    const message = err.message || ERROR_MSG;

    res.status(StatusCodes.NOT_FOUND);
    res.json({
      message,
    });

  }

};
