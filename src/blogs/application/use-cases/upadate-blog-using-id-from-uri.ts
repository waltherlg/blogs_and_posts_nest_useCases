import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';

export class UpdateBlogByIdFromUriCommand {
  constructor(public blogsId: string,
    public blogUpdateInputModel: UpdateBlogInputModelType){}
}

@CommandHandler(UpdateBlogByIdFromUriCommand)
export class UpdateBlogByIdFromUriUseCase implements ICommandHandler<UpdateBlogByIdFromUriCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: UpdateBlogByIdFromUriCommand,
  ): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogsId);   
    blog.name = command.blogUpdateInputModel.name;
    blog.description = command.blogUpdateInputModel.description;
    blog.websiteUrl = command.blogUpdateInputModel.websiteUrl;
    return await this.blogsRepository.saveBlog(blog);
  }
}
