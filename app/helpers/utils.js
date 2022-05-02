import schedule from 'node-schedule';

export const ERROR_MSG =
  'Looks like the server is taking too long to respond, please try again later';
export const CONN_ERROR =
  'There was an error connecting to the server. Please try again later';

export const cancelNonRepeatSchedule = (scheduleId) => {
  const current_job = schedule.scheduledJobs[scheduleId];

  if (current_job)  {
    current_job.cancel();
  }
}

export const getScheduleDate = (params) => {
  if (!params.repeat) {
    const {year, day, hours, month, minutes} = params;
    return new Date(year, month, day, hours, minutes, 0)
  }

  return params.schedule
}