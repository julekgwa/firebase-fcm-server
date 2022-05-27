import { makeApp } from './app/app.js';
import setTZ from 'set-tz';
import { createDailySchedule } from './app/helpers/utils.js';
import { deleteNotifications } from './app/clients/firebaseClient.js';
setTZ('UTC');

createDailySchedule('00 08 * * MON');
createDailySchedule('00 08 * * WED');
createDailySchedule('00 08 * * FRI');
createDailySchedule('00 08 * * SAT', deleteNotifications);

makeApp()
  .then((app) => app.listen(8080))
  .then(() => {

    console.log('Server started');

  })
  .catch((err) => {

    console.error('caught error', err);

  });
