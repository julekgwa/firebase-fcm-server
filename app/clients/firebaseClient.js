import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from 'config';
import jwt from 'jsonwebtoken';
import FCM from 'fcm-node';
import { randomUUID } from 'crypto';
import { dateInPast } from '../helpers/utils.js';

const SECRET_KEY = config.get('secretKey');
const NUM_DAYS = 7;
const serviceAccountKey = config.get('firebase.serviceKey');
const dbCollection = config.get('firebase.document');
const fcm = new FCM(serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const db = getFirestore();
const usersCollection = db.collection(dbCollection);

const getUserTokens = async (uid) => {

  const userRef = usersCollection.doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {

    return;

  }

  return doc.data().tokens;

};

const addNotification = (uid, title, body ) => {

  if (!uid) {

    return;

  }

  const userRef = usersCollection.doc(uid);

  if (!userRef) {

    return;

  }

  return userRef.update({
    [`notifications.${randomUUID()}`]: {
      time: Date.now(),
      subText: body,
      title,
    },
  });

};

const usersTokens = async () => {

  const users = await usersCollection.get();

  if (users.empty) {

    return;

  }

  const tokens = [];

  users.forEach((doc) => {

    if (!doc.data().schedule) {

      if (doc.data().tokens) {

        tokens.push(...doc.data().tokens);

      }

    }

  });

  return tokens;

};

const sendWeeklyNotification = async () => {

  const tokens = await usersTokens();

  await sendMessage('', 'Smoking Schedule', 'Add a smoking schedule', tokens);

};

const deleteNotifications = async () => {

  const users = await usersCollection.get();

  if (users.empty) {

    return;

  }

  users.forEach((doc) => {

    if (doc.data().notifications) {

      const now = new Date();

      now.setDate(now.getDate() - NUM_DAYS);
      const notifications = doc.data().notifications;

      for (const key of Object.keys(notifications)) {

        if (notifications[key].time) {

          const d = new Date(notifications[key].time);

          if (dateInPast(d, now)) {

            delete notifications[key];

          }

        }

      }
      const userRef = usersCollection.doc(doc.id);

      if (userRef) {

        userRef.update({
          ['notifications']: notifications,
        });

      }

    }

  });

};

const sendMessage = async (uid, title, body, tkns = null) => {

  const tokens = tkns || await getUserTokens(uid);

  if (!tokens) {

    return;

  }

  const message = {
    registration_ids: tokens,
    data: {
      notifee: JSON.stringify({
        body: body,
        title: title,
      }),
    },
  };

  fcm.send(message, (err) => {

    if (err) {

      console.log('Failed to send message', err);
      return;

    }
    addNotification(uid, title, body);
    // !repeat && cancelNonRepeatSchedule(scheduleId)

  });

};

const authUserById = async (id) => {

  const userRef = usersCollection.doc(id);
  const doc = await userRef.get();

  if (!doc.exists) {

    throw new Error('Authentication failed');

  }

  return jwt.sign({ id }, SECRET_KEY, {
    expiresIn: '30d',
  });

};

export {
  sendMessage,
  authUserById,
  sendWeeklyNotification,
  deleteNotifications,
};
