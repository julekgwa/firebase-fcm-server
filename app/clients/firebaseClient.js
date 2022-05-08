import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from 'config';
import jwt from 'jsonwebtoken';
import FCM from 'fcm-node';
import { randomUUID } from 'crypto';
// import { cancelNonRepeatSchedule } from '../helpers/utils.js';

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

const sendMessage = async (uid, title, body, scheduleId, repeat) => {

  const tokens = await getUserTokens(uid);

  if (!tokens) {

    return;

  }

  const message = {
    registration_ids: tokens,
    notification: {
      title,
      body,
      channelId: 'default',
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

export { sendMessage, authUserById };
