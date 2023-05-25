import { UserDBType } from '../users/users.types';
import { Types } from 'mongoose';
import { BcryptService } from '../other.services/bcrypt.service';
import { Injectable } from '@nestjs/common';
import { UserDeviceDBType } from '../usersDevices/users-devices.types';
@Injectable()
export class DTOFactory {
  constructor(private readonly bcryptService: BcryptService) {}
  async createUserDTO(createUserData: createUserDataType) {
    const passwordHash = await this.bcryptService.hashPassword(
      createUserData.password,
    );
    const userDTO = new UserDBType(
      new Types.ObjectId(),
      createUserData.login,
      passwordHash,
      createUserData.email,
      new Date().toISOString(),
      false,
      createUserData.confirmationCode || null,
      createUserData.expirationDateOfConfirmationCode || null,
      createUserData.isConfirmed || false,
      null,
      null,
      [],
      [],
    );
    return userDTO;
  }
}

type createUserDataType = {
  login: string;
  password: string;
  email: string;
  isConfirmed?: boolean;
  confirmationCode?: string;
  expirationDateOfConfirmationCode?: Date;
};
