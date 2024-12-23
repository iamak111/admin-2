const accountSid = 'AC5b41aff5187079d52698d0648f4200be';
const authToken = '57dd25aac97c44293900ffd9fb7fe24b';
// const client = require('twilio')(accountSid, authToken);

// const sendSMS = async (options) => {
//     await client.messages.create({
//         body: options.message,
//         messagingServiceSid: 'MG581f79b4861f8a1b344cc5cb10b0697a',
//         to: options.phone
//     });
// };
// const Vonage = require('@vonage/server-sdk');

// const vonage = new Vonage({
//     apiKey: 'e661cc90',
//     apiSecret: 'clK8Sdo7aO5nQ8AG'
// });
// const sendSMS = async (options) => {
//     const from = 'Vonage APIs';
//     const to = '918248335181';
//     const text = options.message;

//     vonage.message.sendSms(from, to, text, (err, responseData) => {
//         if (err) {
//             console.log(err);
//         } else if (responseData.messages[0].status === '0') {
//             console.log('Message sent successfully.');
//         } else {
//             console.log(
//                 `Message failed with error: ${responseData.messages[0]['error-text']}`
//             );
//         }
//     });
// };
module.exports = sendSMS;
