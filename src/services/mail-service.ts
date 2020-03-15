const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');

interface MailObject {
  to: string;
  subject: string,
  attributes: object
}

export class MailService {
  constructor(
    // create reusable transporter object using the default SMTP transport
    private transporter = nodemailer.createTransport({
      type: process.env.MAIL_TYPE,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: (process.env.MAIL_PORT === '465'), // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  ) { }

  async sendEmail(template: string, data: MailObject): Promise<object> {
    try {
      const html = fs.readFileSync(process.env.PWD + '/public/' + template, { encoding: 'utf-8' });
      const mailTemplate = handlebars.compile(html);
      const replacements = data.attributes;
      const htmlToSend = mailTemplate(replacements);

      // send mail with defined transport object
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM_NAME, // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        html: htmlToSend // html body
      });

      console.log(info);
      return { messageId: info.messageId };

    } catch (error) {
      console.log('Error Mail: ' + error);
      throw new Error(error);
    }
  }
}
