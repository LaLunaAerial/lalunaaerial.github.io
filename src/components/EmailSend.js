import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: 'lalunaaerialstudio@gmail.com',
    pass: 'epegjjanhynqoyga',
  },
});

await transporter.sendMail({
    to: "la.luna.aerial@gmail.com", // receiver email
    subject: "Testing Notification email",
    html: `
    <h2>Title of the email</h2>
    <p>Testing</p>
    <p>This email is generate by the one off node.js code.</p>
  `,
  });