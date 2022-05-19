import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from 'config';
import jwt from 'jsonwebtoken';
import FCM from 'fcm-node';
import { randomUUID } from 'crypto';

const SECRET_KEY = config.get('secretKey');
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

  await sendMessage('', 'Weekly', 'Testing weekly notifications', tokens);

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
    // notification: {
    //   title,
    //   body,
    //   icon: 'ic_stat_name',
    //   smallIcon: 'ic_stat_name',
    //   largeIcon: 'https://firebasestorage.googleapis.com/v0/b/aboutyou-d722a.appspot.com/o/icon.png?alt=media&token=bd427ab7-2444-4292-9bc5-3bc180bb74e6',
    //   imageUrl: 'https://firebasestorage.googleapis.com/v0/b/aboutyou-d722a.appspot.com/o/icon.png?alt=media&token=bd427ab7-2444-4292-9bc5-3bc180bb74e6',
    // },
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
};
