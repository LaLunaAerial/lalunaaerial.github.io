/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

const functions=require('firebase-functions');
const nodemailer=require('nodemailer');

const cors = require('cors')({ origin: true });

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


exports.sendMail= functions.https.onRequest(async (req,res)=>{cors(req, res,async () => {
    const { to, subject, html } = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: 'lalunaaerialstudio@gmail.com',
          pass: 'epegjjanhynqoyga',
        },
      });
    
      await transporter.sendMail({
        to: to, // receiver email
        subject: subject,
        html: html,
      }).then(() => {
        res.status(200).send('Email sent successfully');
      }).catch((error) => {
        res.status(400).send(error);
      });
})});