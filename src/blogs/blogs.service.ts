import { Injectable } from '@nestjs/common';
import { Blog, BlogDBType, BlogDocument } from './blogs.types';

import { BlogsRepository } from './blogs.repository';
import { Types } from 'mongoose';
import {
  CreateBlogInputModelType,
  UpdateBlogInputModelType,
} from './blogs.controller';
import { validateOrReject } from 'class-validator';
import { BlogNotFoundException } from '../exceptions/custom.exceptions';

const validateOrRejectModel = async (model: any, ctor: { new (): any }) => {
  if (model instanceof ctor === false) {
    throw new Error('Incorrect input data');
  }
  try {
    await validateOrReject(model);
  } catch (error) {
    throw new Error(error);
  }
};

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async createBlog(
    blogCreateInputModel: CreateBlogInputModelType,
  ): Promise<string> {
    //await validateOrRejectModel(blogCreateInputModel, CreateBlogInputModelType);
    const blogDTO = new BlogDBType(
      new Types.ObjectId(),
      blogCreateInputModel.name,
      blogCreateInputModel.description,
      blogCreateInputModel.websiteUrl,
      new Date().toISOString(),
      false,
    );
    const newBlogsId = await this.blogsRepository.createBlog(blogDTO);
    return newBlogsId;
  }

  async updateBlogById(
    blogsId: string,
    blogUpdateInputModel: UpdateBlogInputModelType,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogDBTypeById(blogsId);
    if (!blog) {
      throw new BlogNotFoundException(); // в контроллер
    }
    blog.name = blogUpdateInputModel.name;
    blog.description = blogUpdateInputModel.description;
    blog.websiteUrl = blogUpdateInputModel.websiteUrl;
    return await this.blogsRepository.saveBlog(blog);
  }

  async deleteBlogById(blogsId: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlogById(blogsId);
  }
}
