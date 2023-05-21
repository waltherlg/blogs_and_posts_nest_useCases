import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from 'src/blogs/helpers/blogs.enum.action.result';
import { CreatePostByBlogsIdInputModelType } from 'src/blogs/blogger.blogs.controller';
import { PostsRepository } from 'src/posts/posts.repository';
import { PostDBType } from 'src/posts/posts.types';
import { Types } from 'mongoose';

export class CreatePostFromBloggerControllerCommand {
  constructor(
    public userId: string, 
    public blogId: string, 
    public postCreateDto: CreatePostByBlogsIdInputModelType){}
}

@CommandHandler(CreatePostFromBloggerControllerCommand)
export class CreatePostFromBloggerControllerUseCase implements ICommandHandler<CreatePostFromBloggerControllerCommand> {
  constructor(private readonly postsRepository: PostsRepository, private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: CreatePostFromBloggerControllerCommand,
  ): Promise<BlogActionResult | string> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)
    if(!blog) return BlogActionResult.BlogNotFound
    if(blog.userId !== command.userId) return BlogActionResult.NotOwner
    const postDto = new PostDBType(
      new Types.ObjectId,
      command.postCreateDto.title,
      command.postCreateDto.shortDescription,
      command.postCreateDto.content,
      command.userId,
      command.blogId,
      blog.name,
      new Date().toISOString(),
      0,
      0,
      'None',
      []
    )
    const newPostId = await this.postsRepository.createPost(postDto)
    if(!newPostId) return BlogActionResult.NotCreated
    return newPostId

  }
}
