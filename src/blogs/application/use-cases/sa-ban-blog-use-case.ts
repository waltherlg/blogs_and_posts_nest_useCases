import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';
import { BanUserForBlogInputModelType } from 'src/blogs/api/blogger.blogs.controller';
import { BannedBlogUsersType, Blog } from 'src/blogs/blogs.types';
import { th } from 'date-fns/locale';
import { UsersRepository } from 'src/users/users.repository';
import { BanBlogInputModelType } from 'src/blogs/api/sa.blogs.controller';

export class SaBanBlogCommand {
  constructor(public blogId: string, public banBlogDto: BanBlogInputModelType){}
}

@CommandHandler(SaBanBlogCommand)
export class SaBanBlogUseCase implements ICommandHandler<SaBanBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository, private readonly usersRepository: UsersRepository,) {}

  async execute(
    command: SaBanBlogCommand,
  ): Promise<BlogActionResult> {

    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId);
    if(!blog) return BlogActionResult.BlogNotFound
    blog.isBlogBanned = command.banBlogDto.isBanned
    const result = await this.blogsRepository.saveBlog(blog)
    if(result){
      return BlogActionResult.Success
    } else {
      return BlogActionResult.NotSaved
    }
  }
}
