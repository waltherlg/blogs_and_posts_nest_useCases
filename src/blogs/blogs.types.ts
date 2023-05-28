import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export class BlogDBType {
  constructor(
    public _id: Types.ObjectId,
    public name: string,
    public userId: string | null,
    public userName: string | null,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public bannedUsers: Array<BannedBlogUsersType>,    
  ) {}
}

export type BannedBlogUsersType = {
  bannedUserId: string;
  isBanned: boolean;
  banDate: string;
  banReason: string;
}

export type BlogTypeOutput = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogDocument = HydratedDocument<Blog>;


@Schema()
export class Blog {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: Types.ObjectId;
  @Prop()
  name: string;
  @Prop()
  userId: string | null;
  @Prop()
  userName: string | null;
  @Prop()
  description: string;
  @Prop()
  websiteUrl: string;
  @Prop()
  createdAt: string;
  @Prop()
  isMembership: boolean;
  @Prop()
  bannedUsers: Array<BannedBlogUsersType>;
  prepareBlogForOutput() {
    return {
      id: this._id.toString(),
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      isMembership: this.isMembership,
    };
    
}
prepareBlogForSaOutput() {
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description,
    websiteUrl: this.websiteUrl,
    createdAt: this.createdAt,
    isMembership: this.isMembership,
    blogOwnerInfo: {
      userId: this.userId,
      userLogin: this.userName
    }
  };
  
}
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  prepareBlogForOutput: Blog.prototype.prepareBlogForOutput,
  prepareBlogForSaOutput: Blog.prototype.prepareBlogForSaOutput,
};
