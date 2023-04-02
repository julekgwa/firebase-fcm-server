import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from 'config';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { sendPushNotification } from '../helpers/utils.js';
import * as Sentry from '@sentry/node';
const SECRET_KEY = config.get('secretKey');
const serviceAccountKey = config.get('firebase.serviceKey');
const dbCollection = config.get('firebase.document');

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

  sendPushNotification(tokens, title, body).then((res) => {

    addNotification(uid, title, body);

  })
    .catch((e) => {

      Sentry.captureException(e);

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
