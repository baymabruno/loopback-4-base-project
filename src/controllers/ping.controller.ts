import {
  Request,
  RestBindings,
  get,
  ResponseObject,
  post,
  HttpErrors,
} from '@loopback/rest';
import {inject} from '@loopback/context';
import * as specs from '../specs/ping.controller.spec';
import {MailService} from '../services';

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': specs.PingResponse,
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
      '200': specs.PingResponse,
    },
  })
  axiosPing(): object {
    const axios = require('axiosa');

    return axios
      .get(`${this.req.protocol}://${this.req.get('host')}/ping`)
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

  @post('/teste-email', {
    responses: {
      200: specs.MailResponse,
      400: specs.MailErrorResponse,
    },
  })
  async emailTeste(): Promise<object> {
    try {
      const mailService = new MailService();
      return await mailService.sendEmail('emailTeste.html', {
        to: 'bayma@example.com, bayma@example.com',
        subject: 'Hello ✔',
        attributes: {name: 'Bayma'},
      });
    } catch (error) {
      throw new HttpErrors.BadRequest(error);
    }
  }
}
