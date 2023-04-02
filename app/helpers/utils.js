import schedule from 'node-schedule';
import config from 'config';
import fetch from 'node-fetch';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

const SENTRY_DNS = config.get('sentry.dns');

export const ERROR_MSG =
  'Looks like the server is taking too long to respond, please try again later';
export const CONN_ERROR =
  'There was an error connecting to the server. Please try again later';

export const cancelNonRepeatSchedule = (scheduleId) => {

  const currentJob = schedule.scheduledJobs[scheduleId];

  if (currentJob) {

    currentJob.cancel();

  }

};

export const getScheduleDate = (params) => {

  if (!params.repeat) {

    const { year, day, hours, month, minutes } = params;

    // eslint-disable-next-line no-magic-numbers
    return new Date(year, month, day, hours, minutes, 0);

  }

  const scheduleDate = new Date(Date.now());

  scheduleDate.setHours(params.hours);
  scheduleDate.setMinutes(params.minutes);
  const hours2 = scheduleDate.getHours();
  const minutes2 = scheduleDate.getMinutes();
  const scheduled = `${minutes2} ${hours2} * * *`;

  return scheduled;

};

export const initializeSentry = (app) => {

  Sentry.init({
    dsn: SENTRY_DNS,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

};

export const sendPushNotification = async (expoPushToken, title, body) => {

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
  };

  return fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

};
