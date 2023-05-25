import {
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
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
  async getAllBlogs(@Query() queryParams: RequestBlogsQueryModel) {
    const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
    return await this.blogsQueryRepository.getAllBlogs(mergedQueryParams);
  }
}
