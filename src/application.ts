import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {ProjectSequence} from './sequence';
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
  TokenServiceBindings,
  TokenServiceConstants,
  PasswordHasherBindings,
  UserServiceBindings,
} from './keys';
import {AuthorizationComponent} from '@loopback/authorization';
import {SECURITY_SCHEME_SPEC} from './specs';
import {JWTAuthenticationStrategy} from './strategies';
import {UserService, JWTService, HashPasswordService} from './services';

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');

const pkg: PackageInfo = require('../package.json');

export class BaseProjectLb4Application extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.api({
      openapi: '3.0.0',
      info: {title: pkg.name, version: pkg.version},
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      servers: [{url: '/'}],
    });

    // Binds
    this.setUpBindings();

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    // Bind Authorization component related elements
    this.component(AuthorizationComponent);

    // Set up the custom sequence
    this.sequence(ProjectSequence);

    // Resiter JWTAuthentication Strategy
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    if (options.rest.openApiSpec.disabled === false) {
      this.bind(RestExplorerBindings.CONFIG).to({path: '/explorer'});
      this.component(RestExplorerComponent);
    }

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings() {
    // Binds package.json to the application context
    this.bind(PackageKey).to(pkg);

    // Bind authenticate
    this.setUpAuthenticateBinds();

    // Bind dependecy injections classes
    this.setUpDependecyInjectionBindings();
  }

  setUpAuthenticateBinds(): void {
    // Bind secret token
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );

    // Bind time token expires
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    // Bind token service
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    // Bind bcrypt hash services - utilized by 'UserController' and 'UserService'
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(
      HashPasswordService,
    );
  }

  setUpDependecyInjectionBindings(): void {
    // Bind user service
    this.bind(UserServiceBindings.USER_SERVICE).toClass(UserService);
  }
}
