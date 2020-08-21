// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {HttpErrors, Request} from '@loopback/rest';
import {promisify} from 'util';
import {TokenService} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {TokenServiceBindings} from '../keys';
import {EntityNotFoundError, Filter, repository, Where} from "@loopback/repository";
import {User} from "../models";
import {UserRepository} from "../repositories";

// @ts-ignore


export interface MTokenService {
  /**
   * Verifies the validity of a token string and returns a user profile
   */
  verifyToken(token: string,instance: string): Promise<User|undefined>;
  /**
   * Verifies the validity of a token string and returns a user profile
   */
  verifyTokenJWTstrategy(token: string): Promise<UserProfile>;
  /**
   * Generates a token string based on a user profile
   */
  generateToken(userProfile: UserProfile): Promise<string>;
  /**
   * Extract token from credentials
   */
  extractCredentials(request: Request):string;
}

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements MTokenService {
  constructor(
      @inject(TokenServiceBindings.TOKEN_SECRET)
      private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
    @repository(UserRepository)
    public clientRepository: UserRepository,
  ) {}

  async verifyToken(token: string, instance:string): Promise<User|undefined> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {[securityId]: '', name: ''},
        {
          [securityId]: decodedToken.id,
          name: decodedToken.name,
          id: decodedToken.id,
          roles: decodedToken.roles,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }

      return await this.clientRepository.findOne(new class implements Filter<User> {
        where: Where<User> = {id: userProfile[securityId]};
      }) as User;

  }

  async verifyTokenJWTstrategy(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
          `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
          {[securityId]: '', name: ''},
          {
            [securityId]: decodedToken.id,
            name: decodedToken.name,
            id: decodedToken.id,
            roles: decodedToken.roles,
          },
      );

    } catch (error) {
      throw new HttpErrors.Unauthorized(
          `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }
    const userInfoForToken = {
     id: userProfile[securityId],
      name: userProfile.name,
      roles: userProfile.roles,
    };
    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }

  extractCredentials(request: Request): string{
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example: Bearer xxx.yyy.zzz
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
          `Authorization header is not of type 'Bearer'.`,
      );
    }

    //split the string into 2 parts: 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
          `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    const token = parts[1];

    return token;
  }
}
