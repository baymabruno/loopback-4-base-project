import {ResponseObject} from '@loopback/rest';

export const PingResponse: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

export const MailResponse: ResponseObject = {
  description: 'Mail Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'MailResponse',
        properties: {
          messageId: {type: 'string'},
        },
      },
    },
  },
};

export const MailErrorResponse: ResponseObject = {
  description: 'Mail Response Error',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'MailErrorResponse',
        properties: {
          statusCode: {type: 'number'},
          name: {type: 'string'},
          message: {type: 'object'},
        },
      },
    },
  },
};
