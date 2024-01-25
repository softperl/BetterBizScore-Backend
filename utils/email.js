const nodemailer = require('nodemailer');
const pug = require('pug');
// const htmlToText = require('html-to-text');

module.exports = class Email {
   constructor(rec, url) {
      this.to_name = rec.name;
      this.to_email = rec.email;
      this.url = url;
      this.from = `${process.env.FROM_NAME} ${process.env.FROM_EMAIL}`;
   }

   createTransport() {
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
         }
      })
   }

   async send(template, subject, email) {
      const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
         subject,
         url: this.url,
         to_name: this.to_name,
         to_email: this.to_email,
         from_name: email.name,
         description: email.description
      })

      let mailOptions;

      if (template === 'contact') {
         mailOptions = {
            from: `${email.name} ${email.email}`,
            to: this.to_email,
            subject,
            html,
            // text: message
            // text: htmlToText.fromString(html),
         };
      } else {
         mailOptions = {
            from: this.from,
            to: this.to_email,
            subject,
            html,
            // text: message
            // text: htmlToText.fromString(html),
         };

      }

      await this.createTransport().sendMail(mailOptions);
   }

   async sendVerifyEmail() {
      await this.send('verify', 'Please verify your email address!', {})
   }

   async sendForgotEmail() {
      await this.send('forgot', 'Reset your password!', {})
   }

   async sendContactEmail(email) {
      await this.send('contact', 'Email received from Better Biz Website', email)
   }
}