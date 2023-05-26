import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Post, PostDBType, PostDocument } from './posts.types';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async savePost(post: PostDocument) {
    const result = await post.save();
    return !!result;
  }

  async createPost(postDTO: PostDBType): Promise<string> {
    const newPost = new this.postModel(postDTO);
    await newPost.save();
    return newPost._id.toString();
  }

  async deletePostById(postId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(postId)) {
      return false;
    }
    return this.postModel.findByIdAndDelete(postId);
  }

  async getPostDBTypeById(postId): Promise<PostDocument | null> {
    if (!Types.ObjectId.isValid(postId)) {
      return null;
    }
    const post: PostDocument = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }
    return post;
  }

 async getAllPostsByUserId(userId): Promise<Array<PostDBType>>{
  return await this.postModel.find({userId: userId})
 }

 async setBanStatusForPosts(userId: string, isBanned: boolean): Promise<boolean>{
  const banPostsResult = await this.postModel.updateMany({userId: userId}, {$set: {isBanned: isBanned}})
  const banLikesPostResult = await this.postModel.updateMany(
    { "likesCollection.userId": userId },
    { $set: { "likesCollection.$[elem].isBanned": isBanned } },
    { arrayFilters: [{ "elem.userId": userId }] }
  );

  return !!banLikesPostResult
 }

  async deleteAllPosts() {
    await this.postModel.deleteMany({});
  }
}
