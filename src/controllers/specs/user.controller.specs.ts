
export const UserProfileSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
  },
};

const CredentialsSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string'
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': { schema: CredentialsSchema },
  },
};

const NewUserSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    username: {
      type: 'string',
      minLength: 5
    },
    password: {
      type: 'string',
      minLength: 8
    },
  },
}

export const NewUserRequestBoby = {
  description: 'Input of new user',
  required: true,
  content: {
    'application/json': { schema: NewUserSchema }
  }
}
