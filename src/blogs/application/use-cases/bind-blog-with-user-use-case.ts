import { Injectable } from '@nestjs/common';
import { BlogDBType } from '../../blogs.types';

import { BlogsRepository } from '../../blogs.repository';
import { Types } from 'mongoose';
import {
  CreateBlogInputModelType,
} from '../../public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string){}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(
    command: BindBlogWithUserCommand
  ): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)
    if(!blog) return false
    if(!blog.userId !== null) return false
    blog.userId = command.userId
    const result = await this.blogsRepository.saveBlog(blog)
    return !!result
  }
}
