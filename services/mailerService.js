const nodemailer = require('nodemailer');

module.exports = class Mailer {

    mail(receiver, subject, body) {
        //set up the connection to your smtp server
        const mailOptions = {
            from: process.env.EMAIL_APP_ADDRESS,
            to: receiver,
            subject: subject,
            html: body
        };
        // this is a single ad-hoc connection, if you want pool - check nodemailer smtp transport docs
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_AUTH_USERNAME,
                pass: process.env.EMAIL_AUTH_PASSWORD
            }
        });
        /*
        transporter.sendMail(mailOptions, function (err, info) {
            err ? console.log(err) : console.log(info)
        });
        */
    }

}
