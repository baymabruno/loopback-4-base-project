import isemail from 'isemail';
import { HttpErrors } from '@loopback/rest';
import { User } from '../models';

export function validateCredentials(user: User) {

  // Validate Email
  if (!isemail.validate(user.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid email');
  }

  // Validate Password Length
  if (!user.password || user.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password must be minimum 8 characters',
    );
  }

  // Validate Username Length
  if (!user.username || user.username.length < 5) {
    throw new HttpErrors.UnprocessableEntity(
      'username must be minimum 5 characters',
    );
  }
}
