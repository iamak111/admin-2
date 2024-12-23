const admin = require('firebase-admin');
const serviceAccount = require('../controllers/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'ctemp-c5403.appspot.com' // Replace with your Firebase Storage bucket URL
});

const bucket = admin.storage().bucket();

module.exports = bucket;
