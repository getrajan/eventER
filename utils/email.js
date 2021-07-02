const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        // host: 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT,
        // port: 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            // user: '36180b7a5ca73c',
            pass: process.env.EMAIL_PASSWORD
            // pass: 'd831ce0363940f'
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Rajan Karki <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
