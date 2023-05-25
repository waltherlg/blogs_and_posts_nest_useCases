import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';

export class UpdateBlogByIdFromUriCommand {
  constructor(public blogsId: string, public userId: string,
    public blogUpdateInputModel: UpdateBlogInputModelType){}
}

@CommandHandler(UpdateBlogByIdFromUriCommand)
export class UpdateBlogByIdFromUriUseCase implements ICommandHandler<UpdateBlogByIdFromUriCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: UpdateBlogByIdFromUriCommand,
  ): Promise<BlogActionResult> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogsId);
    if(!blog) return BlogActionResult.BlogNotFound
    if(blog.userId !== command.userId) return BlogActionResult.NotOwner
    blog.name = command.blogUpdateInputModel.name;
    blog.description = command.blogUpdateInputModel.description;
    blog.websiteUrl = command.blogUpdateInputModel.websiteUrl;
    const result = await this.blogsRepository.saveBlog(blog);
    if(result) {
      return BlogActionResult.Success
    } else { 
      return BlogActionResult.NotSaved
    }
  }
}
