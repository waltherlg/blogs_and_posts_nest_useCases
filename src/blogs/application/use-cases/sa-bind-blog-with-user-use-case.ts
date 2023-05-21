import { Injectable } from '@nestjs/common';
import { BlogDBType } from '../../blogs.types';

import { BlogsRepository } from '../../blogs.repository';
import { Types } from 'mongoose';
import {
  CreateBlogInputModelType,
} from '../../public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from 'src/blogs/helpers/blogs.enum.action.result';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string){}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(
    command: BindBlogWithUserCommand
  ): Promise<BlogActionResult> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)
    if(!blog) return BlogActionResult.BlogNotFound
    if(blog.userId !== null) return BlogActionResult.UserAlreadyBound
    blog.userId = command.userId
    const result = await this.blogsRepository.saveBlog(blog)
    if (result) return BlogActionResult.Success
  }
}
