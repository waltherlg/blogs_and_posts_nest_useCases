import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';
import { BcryptService } from '../other.services/bcrypt.service';
import { DTOFactory } from '../helpers/DTO.factory';
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
    private readonly dtoFactory: DTOFactory,
  ) {}
  async createUser(userCreateInputModel) {
    const userCreateModel = {
      ...userCreateInputModel,
      isConfirmed: true,
    };
    const userDTO = await this.dtoFactory.createUserDTO(userCreateModel);
    const newUsersId = await this.usersRepository.createUser(userDTO);
    return newUsersId;
  }
  async deleteUserById(userId: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(userId);
  }
  async currentUserInfo(userId: string){
    const user = await this.usersRepository.getUserDBTypeById(userId)
    if (!user) {
        return null
    }
    return {
        email: user.email,
        login: user.login,
        userId
    }
  }
}
