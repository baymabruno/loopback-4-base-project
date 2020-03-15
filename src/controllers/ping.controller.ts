import { Request, RestBindings, get, ResponseObject, HttpErrors } from '@loopback/rest';
import { inject } from '@loopback/context';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: { type: 'string' },
          date: { type: 'string' },
          url: { type: 'string' },
          headers: {
            type: 'object',
            properties: {
              'Content-Type': { type: 'string' },
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

const MAIL_RESPONSE: ResponseObject = {
  description: 'Mail Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'MailResponse',
        properties: {
          messageId: { type: 'string' }
        }
      }
    }
  }
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) { }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @get('/axios/ping', {
    responses: {
      '200': PING_RESPONSE
    }
  })
  axiosPing(): object {
    const axios = require('axios');

    return axios.get('http://127.0.0.1:8000/ping')
      .then(function (response: ResponseObject) {

        console.log(response.data);

        return response.data;
      })
      .catch(function (error: ResponseObject) {
        if (error.response) {

          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);

          return error.response.data;

        } else if (error.request) {
          console.log(error.request);
          return error.request;

        } else {
          console.log('Error', error.message);
          return error.request;
        }
      });
  }

  @get('/teste-email', {
    responses: {
      200: MAIL_RESPONSE,
      400: {
        description: 'Mail Response Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'MailErrorResponse',
              properties: {
                'statusCode': { type: 'number' },
                'name': { type: 'string' },
                'message': { type: 'object' },
              }
            }
          }
        }
      }
    }
  })
  async emailTeste(): Promise<object> {

    const nodemailer = require("nodemailer");
    const handlebars = require('handlebars');
    const fs = require('fs');

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
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
    });

    try {
      const html = fs.readFileSync(process.env.PWD + '/public/emailTeste.html', { encoding: 'utf-8' });
      const template = handlebars.compile(html);
      const replacements = {
        name: "Bayma Bruno"
      };
      const htmlToSend = template(replacements);

      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        html: htmlToSend // html body
      });

      console.log(info);
      return { messageId: info.messageId };

    } catch (error) {
      console.log('Error Mail: ' + error);
      throw new HttpErrors.BadRequest(error);
    }
  }
}
