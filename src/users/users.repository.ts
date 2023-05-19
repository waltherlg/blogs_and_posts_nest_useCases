import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.types';
import { PasswordRecoveryModel } from '../auth/auth.types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async saveUser(user: UserDocument): Promise<boolean> {
    const result = await user.save();
    return !!result;
  }

  async createUser(userDTO): Promise<string> {
    const newUser = new this.userModel(userDTO);
    await newUser.save();
    return newUser._id.toString();
  }

  async deleteUserById(userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    return this.userModel.findByIdAndDelete(userId);
  }

  async getUserDBTypeById(userId): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }
    return user;
  }

  async deleteAllUsers() {
    await this.userModel.deleteMany({});
  }
  async getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.userModel.findOne({
      confirmationCode: code,
    });
    if (!user) {
      return null;
    }
    return user;
  }
  async getUserByPasswordRecoveryCode(code: string) {
    const user: UserDocument = await this.userModel.findOne({
      passwordRecoveryCode: code,
    });
    if (!user) {
      return null;
    }
    return user;
  };

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.userModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return user;
  }

  async updateConfirmation(code: string) {
    const result = await this.userModel.updateOne(
      { code },
      {
        $set: {
          isConfirmed: true,
          confirmationCode: null,
          expirationDateOfConfirmationCode: null,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async refreshConfirmationCode(refreshConfirmationData: any) {
    const result = await this.userModel.updateOne(
      { email: refreshConfirmationData.email },
      {
        $set: {
          confirmationCode: refreshConfirmationData.confirmationCode,
          expirationDate: refreshConfirmationData.expirationDate,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async addPasswordRecoveryData(
    passwordRecoveryData: PasswordRecoveryModel,
  ): Promise<boolean> {
    const user = await this.userModel.findOne({
      email: passwordRecoveryData.email,
    });
    user.passwordRecoveryCode = passwordRecoveryData.passwordRecoveryCode;
    user.expirationDateOfRecoveryCode =
      passwordRecoveryData.expirationDateOfRecoveryCode;
    const result = user.save();
    return !!result;
  }

  async newPasswordSet(_id: Types.ObjectId, passwordHash: string) {
    if (!Types.ObjectId.isValid(_id)) {
      return null;
    }
    const user = await this.userModel.findById(_id);
    const result = await this.userModel.updateOne(
      { _id: _id },
      {
        $set: {
          passwordHash: passwordHash,
          passwordRecoveryCode: null,
          expirationDateOfRecoveryCode: null,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async createCommentsLikeObject(
    userId: string,
    commentsId: string,
    createdAt: Date,
    status: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const _id = new Types.ObjectId(userId);
    const user = await this.userModel.findOne({ _id: _id });
    if (!user) {
      return false;
    }
    const newLikedComment = { commentsId, createdAt, status };
    user.likedComments.push(newLikedComment);
    const result = await user.save();
    return !!result;
  }

  async isUserAlreadyLikeComment(
    userId: string,
    commentsId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const _id = new Types.ObjectId(userId);
    const isExist = await this.userModel.findOne({
      _id: _id,
      likedComments: { $elemMatch: { commentsId: commentsId } },
    });
    return !!isExist;
  }

  async updateCommentsLikeObject(
    userId: string,
    commentsId: string,
    status: string,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const _id = new Types.ObjectId(userId);
    const updateStatus = await this.userModel.findOneAndUpdate(
      { _id: _id, 'likedComments.commentsId': commentsId },
      { $set: { 'likedComments.$.status': status } },
    );
    return true;
  }

  async getUsersLikedComments(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    const _id = new Types.ObjectId(userId);
    const user = await this.userModel.findOne({ _id: _id });
    if (!user) return null;
    return user.likedComments;
  }
}
