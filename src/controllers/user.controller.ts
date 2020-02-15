import {
  Count,
  CountSchema,
  Filter,
  repository,
  model,
  property,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  requestBody,
} from '@loopback/rest';
import { User } from '../models';
import { UserRepository, Credentials } from '../repositories';
import { validateCredentials } from '../services/validator';
import { PasswordHasherBindings, UserServiceBindings, TokenServiceBindings } from '../keys';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import { inject } from '@loopback/core';
import _ from 'lodash';
import { CredentialsRequestBody, UserProfileSchema } from './specs/user.controller.specs';
import { UserService, TokenService, authenticate } from '@loopback/authentication';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';


@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
    @inject(UserServiceBindings.USER_SERVICE) public userService: UserService<User, Credentials>,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
  ) { }

  // Create user
  @post('/user/create')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    // All new users have the "customer" role by default
    newUserRequest.roles = ['customer'];

    // ensure a valid email value and password value
    validateCredentials(_.pick(newUserRequest, ['email', 'password']));

    // encrypt the password
    const password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );

    // create the new user
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    // set the password
    await this.userRepository
      .userCredentials(savedUser.id)
      .create({ password });

    return savedUser;
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
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{ token: string }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return { token };
  }

  // Count all users
  @get('/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(): Promise<Count> {
    return this.userRepository.count();
  }

  // Get Authenticated user
  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
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
    const userId = currentUserProfile[securityId];
    return this.userRepository.findById(userId);
  }

  // Get User by Id
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  // Users list
  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
  ): Promise<User[]> {
    return this.userRepository.find();
  }
}
