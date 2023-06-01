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

export class BanUserForSpecificBlogCommand {
  constructor(public bloggerId: string, public bannedUserId: string,
    public banUserDto: BanUserForBlogInputModelType){}
}

@CommandHandler(BanUserForSpecificBlogCommand)
export class BanUserForSpecificBlogUseCase implements ICommandHandler<BanUserForSpecificBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository, private readonly usersRepository: UsersRepository,) {}

  async execute(
    command: BanUserForSpecificBlogCommand,
  ): Promise<BlogActionResult> {
    const bloggerId = command.bloggerId
    const bannedUserId = command.bannedUserId
    const banStatus = command.banUserDto.isBanned
    const banReason = command.banUserDto.banReason
    const blogId = command.banUserDto.blogId

    const blog = await this.blogsRepository.getBlogDBTypeById(blogId);
    if(!blog) return BlogActionResult.BlogNotFound

    if(blog.userId !== bloggerId) return BlogActionResult.NotOwner
    const user = await this.usersRepository.getUserDBTypeById(bannedUserId)
    if(!user){
      return BlogActionResult.UserNotFound
    }

    if(banStatus === true){
      if(blog.bannedUsers.some(user => user.id === bannedUserId)){
        return BlogActionResult.UserAlreadyBanned
      }
      const banUserInfo: BannedBlogUsersType = {
        id: bannedUserId,
        login: user.login,
        isBanned: true,
        banDate: new Date().toISOString(),
        banReason: banReason,
      }
      blog.bannedUsers.push(banUserInfo)
      blog.markModified('bannedUsers');
      const result = await this.blogsRepository.saveBlog(blog)
      if (result){
        return BlogActionResult.Success
      } else {
        return BlogActionResult.NotSaved
      }
    }

    if(banStatus === false){
      const banedIndex = blog.bannedUsers.findIndex(user => user.id === bannedUserId)
      if (banedIndex === -1) {
        return BlogActionResult.UserNotBanned
      }
      blog.bannedUsers.splice(banedIndex, 1);
      blog.markModified('bannedUsers');
      const result = await this.blogsRepository.saveBlog(blog)
      if (result){
        return BlogActionResult.Success
      } else {
        return BlogActionResult.NotSaved
      }
    }
  }
}
