import { sendMessage } from '../clients/firebaseClient.js';
import schedule from 'node-schedule';
import { ERROR_MSG, getScheduleDate } from '../helpers/utils.js';

export const updateNotification = (req, res) => {
  try {
    const notificationId = req.params.id;
    const current_job = schedule.scheduledJobs[notificationId];

    if (current_job) {
      current_job.cancel();
    }

    const scheduled = getScheduleDate(req.body);

    schedule.scheduleJob(notificationId, scheduled, function () {
      sendMessage(
        req.user.id,
        req.body.title,
        req.body.body,
        notificationId,
        req.body.repeat
      );
    });

    res.status(200).json({
      ok: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || ERROR_MSG,
    });
  }
};
