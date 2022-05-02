import schedule from 'node-schedule';
import { StatusCodes } from 'http-status-codes';
import { sendMessage } from '../clients/firebaseClient.js';
import { ERROR_MSG, getScheduleDate } from '../helpers/utils.js';

export const scheduleNotification = (req, res) => {

  try {

    const notificationId = req.params.id;
    const currentJob = schedule.scheduledJobs[notificationId];

    const scheduled = getScheduleDate(req.body);

    if (!currentJob) {

      schedule.scheduleJob(notificationId, scheduled, () => {

        sendMessage(
          req.user.id,
          req.body.title,
          req.body.body,
          notificationId,
          req.body.repeat,
        );

      });

    }

    res.status(StatusCodes.OK).json({
      ok: true,
    });

  } catch (error) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || ERROR_MSG,
    });

  }

};
