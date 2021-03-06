import { pre, prop, modelOptions, DocumentType, Ref, Typegoose, arrayProp } from '@typegoose/typegoose';
import faker from 'faker';
import { randomChoice, titleCase } from '../../utils';
import bcrypt from "bcrypt";

import { IFile } from "../file/model"

export enum Role {
  ADMIN = "admin",
  USER = "user"
}
const ROLES = [Role.ADMIN, Role.USER];

@pre<IUser>('save', function(next) {
  if(!this.isModified('password')) {
    return next();
  } else {
    const SALT = bcrypt.genSaltSync(10);
    const user = this;
    bcrypt.hash(user.password, SALT, function(err, encrypted: string) {
      if (err) {
        console.error(err);
      } else {
        user.password = encrypted;
      }
      next();
    });
  }
})
@modelOptions({ options: { customName: 'users' } })
export class IUser {
  @prop({ required: true })
  public firstName!: string;

  @prop({ required: true })
  public lastName!: string;

  @prop({ required: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ enum: ROLES })
  public role?: string;

  @prop({ required: true, default: false })
  public isVerified?: boolean;

  @prop({ required: true, default: 0 })
  public count!: number;

  @arrayProp({itemsRef: IFile, default : []})
  public files?: Ref<IFile>[] 
}

export function generateFakeUsers(count: number = 10): IUser[] {
  let users: IUser[] = [];

  // Generate count # of fake users
  for (var i = 0; i < count; i++) {
    const user: IUser = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: "password",
      role: randomChoice(ROLES),
      count: 0
    };
    users.push(user);
  }

  // Generate a development test user for each role
  for (let role of ROLES) {
    const user: IUser = {
      firstName: titleCase(role),
      lastName: "Example",
      email: `${role}@gmail.com`,
      password: "password",
      role,
      count: 0
    };
    users.push(user);
  }

  return users;
}

export async function comparePassword(
  user: DocumentType<IUser>,
  password: string
) {
  return await bcrypt.compare(password, user.password);
}
