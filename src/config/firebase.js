const admin = require('firebase-admin');
const serviceAccount = require('../../config/keys/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;