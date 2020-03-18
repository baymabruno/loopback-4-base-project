const application = require('./dist');

require('dotenv').config();

module.exports = application;

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT || 8000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        setServersFromRequest: true,
        disabled: process.env.APP_OPEN_API_DISABLED === 'true' || false,
        servers: [
          {
            url:
              (process.env.HOST || 'http://127.0.0.1') +
              (process.env.PORT || '8000'),
          },
        ],
        endpointMapping: {
          '/openapi.json': {version: '3.0.0', format: 'json'},
          '/openapi.yaml': {version: '3.0.0', format: 'yaml'},
        },
      },
      apiExplorer: {
        disabled: true,
      },
      cors: {
        origin: '*',
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
        headers: 'Content-Type, Authorization, X-Requested-With',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true,
      },
    },
  };
  application.main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
