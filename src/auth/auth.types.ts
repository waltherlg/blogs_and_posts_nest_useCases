import { IsString, Length } from 'class-validator';

export class UserAuthModel {
  @IsString()
  @Length(1, 1000)
  loginOrEmail: string;
  @IsString()
  @Length(1, 1000)
  password: string;
}

export type PasswordRecoveryModel = {
  email: string;
  passwordRecoveryCode: string;
  expirationDateOfRecoveryCode: Date;
};
