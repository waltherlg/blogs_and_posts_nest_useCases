import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';
import { UpdatePostByBlogsIdInputModelType } from 'src/blogs/blogger.blogs.controller';
import { PostsRepository } from 'src/posts/posts.repository';

export class UpdatePostByIdFromBloggerControllerCommand {
  constructor(public userId: string, public blogsId: string, public postId: string, 
    public postUpdateDto: UpdatePostByBlogsIdInputModelType){}
}

@CommandHandler(UpdatePostByIdFromBloggerControllerCommand)
export class UpdatePostByIdFromBloggerControllerUseCase implements ICommandHandler<UpdatePostByIdFromBloggerControllerCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(
    command: UpdatePostByIdFromBloggerControllerCommand,
  ): Promise<BlogActionResult> {
    const post = await this.postsRepository.getPostDBTypeById(command.postId)
    if(!post) return BlogActionResult.PostNotFound
    if(post.userId !== command.userId) return BlogActionResult.NotOwner
    post.title = command.postUpdateDto.title
    post.shortDescription = command.postUpdateDto.shortDescription
    post.content = command.postUpdateDto.content
    const result = await this.postsRepository.savePost(post)
    if(result) {
      return BlogActionResult.Success
    } else { 
      return BlogActionResult.NotSaved
    }
  }
}
