import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrostracture/blogs.query.repository';
import {
  DEFAULT_BLOGS_QUERY_PARAMS,
  RequestBlogsQueryModel,
} from '../../models/types';


import { BasicAuthGuard } from '../../auth/guards/auth.guards';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from '../application/use-cases/sa-bind-blog-with-user-use-case';
import { BlogActionResult, handleBlogOperationResult } from '../helpers/blogs.enum.action.result';
import { IsBoolean } from 'class-validator';
import { SaBanBlogCommand } from '../application/use-cases/sa-ban-blog-use-case';

export class BanBlogInputModelType {
  @IsBoolean()
  isBanned: boolean;
}

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(@Param('blogId') blogId: string, @Param('userId') userId: string){
    const result: BlogActionResult = await this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
    handleBlogOperationResult(result)}

  @Get()
  async getAllBlogsForSa(@Query() queryParams: RequestBlogsQueryModel) {
    const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
    return await this.blogsQueryRepository.getAllBlogsForSa(mergedQueryParams);
  }

  @Put(':blogId/ban')
  @HttpCode(204)
  async banBlog(@Param('blogId') blogId: string, @Body() banBlogDto: BanBlogInputModelType){
    const result = await this.commandBus.execute(new SaBanBlogCommand(blogId, banBlogDto))
    handleBlogOperationResult(result)
  }
}
