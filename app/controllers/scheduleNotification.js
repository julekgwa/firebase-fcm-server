import { sendMessage } from '../clients/firebaseClient.js';
import schedule from 'node-schedule';
import { ERROR_MSG, getScheduleDate } from '../helpers/utils.js';

export const scheduleNotification = (req, res) => {
  try {
    const notificationId = req.params.id;
    const current_job = schedule.scheduledJobs[notificationId];

    const scheduled = getScheduleDate(req.body)

    if (!current_job) {
      console.log(notificationId);
      schedule.scheduleJob(notificationId, scheduled, function () {
        sendMessage(
          req.user.id,
          req.body.title,
          req.body.body,
          notificationId,
          req.body.repeat
        );
      });
    } else {
      console.log('EXIST');
    }

    res.status(200).json({
      ok: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || ERROR_MSG,
    });
  }
};
