import { Injectable } from '@nestjs/common';
import { BlogDBType } from '../../blogs.types';

import { BlogsRepository } from '../../infrostracture/blogs.repository';
import { Types } from 'mongoose';
import {
  CreateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { UsersRepository } from 'src/users/users.repository';

export class CreateBlogCommand {
  constructor(public userId, public blogCreateInputModel: CreateBlogInputModelType){}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository, private readonly usersRepository: UsersRepository) {}
  async execute(
    command: CreateBlogCommand
  ): Promise<string> {
    const user = await this.usersRepository.getUserDBTypeById(command.userId)
    const blogDTO = new BlogDBType(
      new Types.ObjectId(),
      command.blogCreateInputModel.name,
      command.userId,
      user.login,      
      command.blogCreateInputModel.description,
      command.blogCreateInputModel.websiteUrl,
      new Date().toISOString(),
      false,
    );
    const newBlogsId = await this.blogsRepository.createBlog(blogDTO);
    return newBlogsId;
  }
}
