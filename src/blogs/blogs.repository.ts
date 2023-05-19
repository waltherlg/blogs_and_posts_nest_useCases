import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDBType, BlogDocument, BlogTypeOutput } from './blogs.types';
import { HydratedDocument, Model, Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async saveBlog(blog: HydratedDocument<BlogDBType>) {
    const result = await blog.save();
    return !!result;
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(blogId)) {
      return false;
    }
    return this.blogModel.findByIdAndDelete(blogId);
  }

  async createBlog(blogDTO): Promise<string> {
    const newBlog = new this.blogModel(blogDTO);
    await newBlog.save();
    return newBlog._id.toString();
  }

  async getBlogDBTypeById(blogId): Promise<BlogDocument | null> {
    if (!Types.ObjectId.isValid(blogId)) {
      return null;
    }
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      return null;
    }
    return blog;
  }

  async isBlogExist(blogId): Promise<boolean> {
    if (!Types.ObjectId.isValid(blogId)) {
      return false;
    }
    const blog = await this.blogModel.findById(blogId);
    return !!blog;
  }

  async deleteAllBlogs() {
    await this.blogModel.deleteMany({});
  }
}
