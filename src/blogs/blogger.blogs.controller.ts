import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppService } from '../app.service';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';
import { BlogsQueryRepository } from './blogs.query.repository';
import {
  DEFAULT_BLOGS_QUERY_PARAMS,
  RequestQueryParamsModel,
  RequestBlogsQueryModel,
  DEFAULT_QUERY_PARAMS,
} from '../models/types';
import { MaxLength } from 'class-validator';
import { CheckService } from '../other.services/check.service';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';

import {
  BlogNotFoundException,
  CustomNotFoundException,
  CustomisableException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { BasicAuthGuard } from '../auth/guards/auth.guards';
import { IsCustomUrl, StringTrimNotEmpty } from '../middlewares/validators';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { request } from 'express';
import { CreateBlogCommand, CreateBlogUseCase } from './application/use-cases/create-blog-use-case';
import { UpdateBlogByIdFromUriCommand, UpdateBlogByIdFromUriUseCase } from './application/use-cases/upadate-blog-using-id-from-uri';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogActionResult, handleBlogOperationResult } from './helpers/blogs.enum.action.result';

export class CreateBlogInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(15)
  name: string;
  @StringTrimNotEmpty()
  @MaxLength(500)
  description: string;
  @StringTrimNotEmpty()
  @IsCustomUrl({ message: 'Invalid URL format' })
  websiteUrl: string;
}

export class UpdateBlogInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(15)
  name: string;
  @StringTrimNotEmpty()
  @MaxLength(500)
  description: string;
  @StringTrimNotEmpty()
  @IsCustomUrl({ message: 'Invalid URL format' })
  websiteUrl: string;
}

export class UpdatePostByBlogsIdInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
}

export class CreatePostByBlogsIdInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
}
@UseGuards(JwtAuthGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly checkService: CheckService,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    //private createBlogUseCase: CreateBlogUseCase,
    private updateBlogByIdFromUriUseCase: UpdateBlogByIdFromUriUseCase,
  ) {}
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Req() request,
    @Param('id') blogsId: string,
    @Body() blogUpdateInputModel: UpdateBlogInputModelType,
  ) {  
    const result: BlogActionResult = await this.commandBus.execute(new UpdateBlogByIdFromUriCommand(
      blogsId,
      request.user.userId,
      blogUpdateInputModel,
    ));
    handleBlogOperationResult(result)
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Req() request, @Param('id') blogId: string) {
    const isBlogExist = await this.checkService.isBlogExist(blogId);
    if (!isBlogExist) {
      throw new BlogNotFoundException();
    }
    const result = await this.blogsService.deleteBlogById(blogId);
    if (!result) {
      throw new UnableException('blog deleting');
    }
  }

  @Post()
  async createBlogs(@Body() blogCreateInputModel: CreateBlogInputModelType) {
    const newBlogsId = await this.commandBus.execute(new CreateBlogCommand(blogCreateInputModel));
    const newBlog = await this.blogsQueryRepository.getBlogById(newBlogsId);
    if (!newBlog) {
      throw new UnableException('blog creating');
    }
    return newBlog;
  }

  @Get()
  async getAllBlogsForCurrentUser(@Query() queryParams: RequestBlogsQueryModel, @Req() request) {
    const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
    return await this.blogsQueryRepository.getAllBlogs(mergedQueryParams);
  }


  @Post(':id/posts')
  async createPostByBlogsId(
    @Param('id') blogId: string,
    @Body() inputPostCreateModel: CreatePostByBlogsIdInputModelType,
  ) {
    const postCreateModel = { ...inputPostCreateModel, blogId: blogId };
    //check is blog exist in post service
    const createdPostId = await this.postsService.createPost(postCreateModel);
    const newPost = await this.postsQueryRepository.getPostById(createdPostId);
    if (!newPost) {
      throw new UnableException('post creating');
    }
    return newPost;
  }

  @Put(':blogId/posts/postId')
  async updatePost(@Req() request, 
  @Param('blogId') blogId: string, 
  @Param('postId') postId: string,
  @Body() updatePostDto: UpdatePostByBlogsIdInputModelType){}






}
