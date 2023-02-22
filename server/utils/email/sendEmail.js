const Mailgun = require('mailgun-js');
const handlebars = require("handlebars");

// var helpers = require('handlebars-helpers')({
//     handlebars: handlebars
// });

const fs = require("fs");
const path = require("path");

exports.sendEmail = async (email, payload, template) => {
    try {
        const mailgun = new Mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN,
        });

        // template
        const source = fs.readFileSync(path.join(__dirname, template), "utf8");
        const compiledTemplate = handlebars.compile(source);

        const options = () => {
            return {
                from: process.env.FROM_NOREPLY_EMAIL,
                to: email,
                subject: process.env.EMAIL_SUBJECT_REQUEST_RESET_PASSWORD,
                html: compiledTemplate(payload),
            };
        };

        // Send email
        return mailgun.messages().send(options())
            .then(() => {
                return { status: 200, message: 'Email sent successfully.' };
            })
            .catch((err) => {
                return { status: 400, error: err.message };
            });


    } catch (error) {
        return error;
    }
};