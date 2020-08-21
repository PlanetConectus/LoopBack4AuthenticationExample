import {Entity, model, property} from '@loopback/repository';
import {v4 as uuid} from 'uuid';

@model()
export class User extends Entity {


  @property({
    type: 'string',
    id: true,
    default: () => uuid(),
  })
  id?: string;



  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  age: string;

  @property({
    type: 'date',
    required: true,
  })
  birthDate: string;

  @property({
    type: 'string',
    required: true,
  })
  profession: string;

  @property({
    type: 'boolean',
    required: true,
  })
  engaged: boolean;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;


export type Credentials = {
  email: string;
  password: string;
};
