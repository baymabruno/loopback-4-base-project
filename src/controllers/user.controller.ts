import {
  Count,
  CountSchema,
  Filter,
  repository,
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
import { UserRepository } from '../repositories';
import { validateCredentials } from '../services/validator';
import { PasswordHasherBindings, TokenServiceBindings } from '../keys';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import { inject } from '@loopback/core';
import { UserProfileSchema } from './specs/user.controller.specs';
import { TokenService, authenticate } from '@loopback/authentication';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER) public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
  ) { }

  // Create user
  @post('/user/create')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: User,
  ): Promise<User> {

    // ensure a valid email value and password value
    validateCredentials(newUserRequest);

    // All new users have the "customer" role by default
    newUserRequest.roles = ['customer'];

    // encrypt the password
    newUserRequest.password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );

    // create the new user
    const savedUser = await this.userRepository.create(newUserRequest);

    return savedUser;
  }

  // User Login
  // @post('/user/login', {
  //   responses: {
  //     '200': {
  //       description: 'Token',
  //       content: {
  //         'application/json': {
  //           schema: {
  //             type: 'object',
  //             properties: {
  //               token: {
  //                 type: 'string',
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // async login(
  //   @requestBody(CredentialsRequestBody) credentials: User,
  // ): Promise<{ token: string }> {
  //   // ensure the user exists, and the password is correct
  //   const user = await this.userService.verifyCredentials(credentials);

  //   // convert a User object into a UserProfile object (reduced set of properties)
  //   const userProfile = this.userService.convertToUserProfile(user);

  //   // create a JSON Web Token based on the user profile
  //   const token = await this.jwtService.generateToken(userProfile);

  //   return { token };
  // }

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
