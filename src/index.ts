import { BaseProjectLb4Application } from './application';
import { ApplicationConfig } from '@loopback/core';

export { BaseProjectLb4Application };

export async function main(options: ApplicationConfig = {}) {
  const app = new BaseProjectLb4Application(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  const config = app.restServer.config;

  if (config.openApiSpec.disabled === true) {
    console.log(`> OpenApi disabled \n`);
  } else {
    console.log('> OpenApi is running at:')
    console.log(`- ${url}/explorer`);
    console.log(`- ${url}/openapi.json`);
    console.log(`- ${url}/openapi.yaml \n`);
  }

  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
