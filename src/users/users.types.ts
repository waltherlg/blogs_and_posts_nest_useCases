import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentsLikeType = {
  commentsId: string;
  createdAt: Date;
  status: string;
};

export type PostsLikeType = {
  postsId: string;
  createdAt: Date;
  status: string;
};

export class UserDBType {
  constructor(
    public _id: Types.ObjectId,
    public login: string,
    public passwordHash: string,
    public email: string,
    public createdAt: string,
    public isBanned: boolean,
    public banDate: string | null,
    public banReason: string | null,
    public confirmationCode: string | null,
    public expirationDateOfConfirmationCode: Date | null,
    public isConfirmed: boolean,
    public passwordRecoveryCode: string | null,
    public expirationDateOfRecoveryCode: Date | null,
    public likedComments: Array<CommentsLikeType>,
    public likedPosts: Array<PostsLikeType>,
  ) {}
}

export type UserTypeOutput = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: Types.ObjectId;
  @Prop()
  login: string;
  @Prop()
  passwordHash: string;
  @Prop()
  email: string;
  @Prop()
  createdAt: string;
  @Prop()
  isBanned: boolean;
  @Prop()
  banDate: string | null;
  @Prop()
  banReason: string | null;
  @Prop()
  confirmationCode: string | null;
  @Prop()
  expirationDateOfConfirmationCode: Date | null;
  @Prop()
  isConfirmed: boolean;
  @Prop()
  passwordRecoveryCode: string | null;
  @Prop()
  expirationDateOfRecoveryCode: Date | null;
  @Prop()
  likedComments: Array<CommentsLikeType>;
  @Prop()
  likedPosts: Array<PostsLikeType>;
  prepareUserForOutput() {
    return {
      id: this._id.toString(),
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
      banInfo: {
        isBanned: this.isBanned,
        banDate: this.banDate,
        banReason: this.banReason,
      }
    };
  }
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  prepareUserForOutput: User.prototype.prepareUserForOutput,
};

export type PasswordRecoveryModel = {
  email: string;
  passwordRecoveryCode: string;
  expirationDateOfRecoveryCode: Date;
};
