
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {PasswordHasher} from './service/hash.password.bcryptjs';
import {TokenService, UserService} from '@loopback/authentication';
import {Client, Credentials, Professional} from './models';
import {ClientRepository} from './repositories';
import {MTokenService} from "./service/jwt-service";

export namespace TokenServiceConstants {
    export const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
    export const TOKEN_EXPIRES_IN_VALUE = '604800';
}

export namespace TokenServiceBindings {
    export const TOKEN_SECRET = BindingKey.create<string>(
        'authentication.jwt.secret',
    );
    export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
        'authentication.jwt.expires.in.seconds',
    );
    export const TOKEN_SERVICE = BindingKey.create<MTokenService>(
        'services.authentication.jwt.tokenservice',
    );
}

export namespace PasswordHasherBindings {
    export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
        'services.hasher',
    );
    export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
    export const USER_SERVICE = BindingKey.create<UserService<Client, Credentials>>(
        'services.user.service',
    );
}
export namespace ProfessionalServiceBindings {
    export const PRO_SERVICE = BindingKey.create<UserService<Professional, Credentials>>(
        'services.pro.service',
    );
}
