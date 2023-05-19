import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogs/blogs.types';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/posts.types';
import {
  UsersDevice,
  UsersDeviceDocument,
} from '../usersDevices/users-devices.types';
import { Comment, CommentDocument } from '../comments/comments.types';
import { User, UserDocument } from '../users/users.types';

@Injectable()
export class TestRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UsersDevice.name)
    private usersDeviseModel: Model<UsersDeviceDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async deleteAllData() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.usersDeviseModel.deleteMany({});
    await this.commentModel.deleteMany({});
    return true;
  }
}
