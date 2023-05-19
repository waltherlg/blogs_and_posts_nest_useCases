import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export class CommentDBType {
  constructor(
    public _id: Types.ObjectId,
    public parentType: string,
    public parentId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: string,
  ) {}
}

type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};
type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};
export type CommentTypeOutput = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: string;
  likesInfo: LikesInfoType;
};

export type CommentDocument = HydratedDocument<Comment>;
@Schema()
export class Comment {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  @IsNotEmpty()
  _id: Types.ObjectId;
  @Prop({ required: true })
  @IsNotEmpty()
  parentType: string;
  @Prop({ required: true })
  @IsNotEmpty()
  parentId: string;
  @Prop({ required: true })
  @IsNotEmpty()
  content: string;
  @Prop({ required: true })
  @IsNotEmpty()
  userId: string;
  @Prop({ required: true })
  @IsNotEmpty()
  userLogin: string;
  @Prop({ required: true })
  @IsNotEmpty()
  createdAt: string;
  @Prop({ required: true })
  @IsNotEmpty()
  likesCount: number;
  @Prop({ required: true })
  @IsNotEmpty()
  dislikesCount: number;
  @Prop({ required: true })
  @IsNotEmpty()
  myStatus: string;
  prepareCommentForOutput() {
    return {
      id: this._id.toString(),
      content: this.content,
      commentatorInfo: {
        userId: this.userId,
        userLogin: this.userLogin,
      },
      createdAt: this.createdAt,
      likesInfo: {
        likesCount: this.likesCount,
        dislikesCount: this.dislikesCount,
        myStatus: this.myStatus,
      },
    };
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.methods = {
  prepareCommentForOutput: Comment.prototype.prepareCommentForOutput,
};
