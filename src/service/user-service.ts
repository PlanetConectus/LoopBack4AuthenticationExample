// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HttpErrors} from '@loopback/rest';

import {UserProfile, securityId} from '@loopback/security';
import {repository} from '@loopback/repository';
import {PasswordHasher} from './hash.password.bcryptjs';
import {PasswordHasherBindings} from '../keys';
import {inject} from '@loopback/context';
import {User, Credentials} from "../models";
import {UserRepository} from "../repositories";

export class UserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public clientRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials:Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.clientRepository.findOne({
      where: {email: credentials.email},
    });
    console.log(foundUser);
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const dbUser = await this.clientRepository.findById(foundUser.id,);
    if (!dbUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    console.log(dbUser);

    const passwordMatched = await this.passwordHasher.comparePassword(
        credentials.password,
      dbUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(client: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (client.firstName) userName = `${client.firstName}`;
    if (client.lastName)
      userName = client.firstName
        ? `${userName} ${client.lastName}`
        : `${client.lastName}`;
    const userProfile = {
      [securityId]: client.id,
      name: userName,
      id: client.id,
      roles: 'client'
    };

    return userProfile as UserProfile;
  }


}

class UserServiceImpl extends UserService {
}

