import {Count, CountSchema, Filter, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {validateCredentials} from '../services/validate-credencials.service';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {PasswordHasher} from '../services/';
import {inject} from '@loopback/core';
import * as specs from '../specs/user.controller.spec';
import {TokenService, authenticate} from '@loopback/authentication';
import {UserProfile, securityId, SecurityBindings} from '@loopback/security';
import {UserService} from '../services/user.service';
import {authorizer} from '../services/authorizer.service';
import {authorize} from '@loopback/authorization';
import {rolesEnum} from '../enum';
import {OPERATION_SECURITY_SPEC} from '../specs';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE) public userService: UserService,
  ) {}

  // Create user
  @post('/user/create')
  async create(
    @requestBody(specs.NewUserRequestBoby)
    newUserRequest: User,
  ): Promise<User> {
    // All new users have the 'customer' role by default
    newUserRequest.roles = [rolesEnum.customer];

    // ensure a valid email value and password value
    validateCredentials(newUserRequest);

    // encrypt the password
    newUserRequest.password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );

    try {
      // create the new user
      const savedUser = await this.userRepository.create(newUserRequest);

      return savedUser;
    } catch (error) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  // User Login
  @post('/user/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(specs.CredentialsRequestBody) credentials: User,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  // Count all users
  @get('/user/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(): Promise<Count> {
    return this.userRepository.count();
  }

  // Get Authenticated user
  @get('/user/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: specs.UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    console.log(currentUserProfile);

    const userId = currentUserProfile[securityId];
    return this.userRepository.findById(userId);
  }

  // Get User by Id
  @get('/user/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User /*, { includeRelations: true }*/),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: [rolesEnum.admin, rolesEnum.support, rolesEnum.customer],
    voters: [authorizer],
  })
  async findById(
    @param.path.string('userId') userId: string,
    @param.query.object('filter', getFilterSchemaFor(User))
    filter?: Filter<User>,
  ): Promise<User> {
    return this.userRepository.findById(userId, filter);
  }

  // Users list
  @get('/user/list', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User /*, { includeRelations: true }*/),
            },
          },
        },
      },
    },
  })
  async find(): Promise<User[]> {
    return this.userRepository.find();
  }

  @post('/user/update/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User Updated success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: [rolesEnum.admin, rolesEnum.support],
    voters: [authorizer],
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'UserUpdateRequest',
            exclude: ['id'],
          }),
        },
      },
    })
    user: User,
  ): Promise<void> {
    // ensure a valid email value and password value
    validateCredentials(user);

    // encrypt the password
    user.password = await this.passwordHasher.hashPassword(user.password);

    await this.userRepository.updateById(id, user);
  }
}
