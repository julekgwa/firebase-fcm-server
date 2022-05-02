import { sendMessage } from '../clients/firebaseClient.js';
import schedule from 'node-schedule';
import { ERROR_MSG, getScheduleDate } from '../helpers/utils.js';
import { StatusCodes } from 'http-status-codes';

export const updateNotification = (req, res) => {

  try {

    const notificationId = req.params.id;
    const currentJob = schedule.scheduledJobs[notificationId];

    if (currentJob) {

      currentJob.cancel();

    }

    const scheduled = getScheduleDate(req.body);

    schedule.scheduleJob(notificationId, scheduled, function() {

      sendMessage(
        req.user.id,
        req.body.title,
        req.body.body,
        notificationId,
        req.body.repeat,
      );

    });

    res.status(StatusCodes.OK).json({
      ok: true,
    });

  } catch (error) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || ERROR_MSG,
    });

  }

};
