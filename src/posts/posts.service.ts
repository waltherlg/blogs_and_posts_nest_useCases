import { PostsRepository } from './posts.repository';
import { PostDBType } from './posts.types';
import { Types } from 'mongoose';
import { CreatePostInputModelType } from './posts.controller';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogNotFoundException } from '../exceptions/custom.exceptions';
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogRepository: BlogsRepository,
  ) {}
  async createPost(
    postCreateInputModel: CreatePostInputModelType, userId: string,
  ): Promise<string> {
    const blog = await this.blogRepository.getBlogDBTypeById(
      postCreateInputModel.blogId,
    );
    if (!blog) {
      throw new BlogNotFoundException();
    }
    const postDTO = new PostDBType(
      new Types.ObjectId(),
      postCreateInputModel.title,
      postCreateInputModel.shortDescription,
      postCreateInputModel.content,
      userId,
      postCreateInputModel.blogId,
      blog.name,
      new Date().toISOString(),
      0,
      0,
      'None',
      [],
    );
    const newPostsId = await this.postsRepository.createPost(postDTO);
    return newPostsId;
  }

  async updatePostById(postId, postUpdateInputModel): Promise<boolean> {
    const post = await this.postsRepository.getPostDBTypeById(postId);
    if (!post) {
      return false;
    }
    post.title = postUpdateInputModel.title;
    post.shortDescription = postUpdateInputModel.shortDescription;
    post.content = postUpdateInputModel.content;
    return await this.postsRepository.savePost(post);
  }
  async deletePostById(postId: string): Promise<boolean> {
    return await this.postsRepository.deletePostById(postId);
  }
}
