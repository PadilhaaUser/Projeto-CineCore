const admin = require('firebase-admin');

// Initialize Firebase Admin with credentials from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle the newline characters in the private key
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized Successfully.');
    } else {
        console.warn('Firebase credentials not fully provided in .env. Firebase not initialized.');
    }
}

let db = null;
if (admin.apps.length) {
    db = admin.firestore();
}

module.exports = { admin, db };
