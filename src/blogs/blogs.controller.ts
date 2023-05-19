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
  CustomisableException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { BasicAuthGuard } from '../auth/guards/auth.guards';
import { IsCustomUrl, StringTrimNotEmpty } from '../middlewares/validators';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { request } from 'express';

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
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly appService: AppService,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly checkService: CheckService,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlogs(@Body() blogCreateInputModel: CreateBlogInputModelType) {
    const newBlogsId = await this.blogsService.createBlog(blogCreateInputModel);
    const newBlog = await this.blogsQueryRepository.getBlogById(newBlogsId);
    if (!newBlog) {
      throw new UnableException('blog creating');
    }
    return newBlog;
  }
  @Get(':id')
  async getBlogById(@Param('id') blogsId: string) {
    const blog = await this.blogsQueryRepository.getBlogById(blogsId);
    if (!blog) {
      throw new CustomisableException('blog', 'blog not found', 404);
    }
    return blog;
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') blogsId: string,
    @Body() blogUpdateInputModel: UpdateBlogInputModelType,
  ) {
    // check is blog exist in blogService
    const result = await this.blogsService.updateBlogById(
      blogsId,
      blogUpdateInputModel,
    );
    if (!result) {
      throw new UnableException('blog updating');
    }
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') blogId: string) {
    const isBlogExist = await this.checkService.isBlogExist(blogId);
    if (!isBlogExist) {
      throw new BlogNotFoundException();
    }
    const result = await this.blogsService.deleteBlogById(blogId);
    if (!result) {
      throw new UnableException('blog deleting');
    }
  }

  @Get()
  async getAllBlogs(@Query() queryParams: RequestBlogsQueryModel) {
    const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
    return await this.blogsQueryRepository.getAllBlogs(mergedQueryParams);
  }
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/posts')
  async getAllPostsByBlogsId(
    @Req() request,
    @Param('id') blogId: string,
    @Query() queryParams: RequestQueryParamsModel,
  ) {
    await this.isBlogExist(blogId);

    if (!(await this.checkService.isBlogExist(blogId))) {
      throw new BlogNotFoundException();
    }
    const mergedQueryParams = { ...DEFAULT_QUERY_PARAMS, ...queryParams };
    return await this.postsQueryRepository.getAllPostsByBlogsId(
      mergedQueryParams,
      blogId,
      request.user,
    );
  }
  async isBlogExist(blogId) {
    if (!(await this.checkService.isBlogExist(blogId))) {
      throw new BlogNotFoundException();
    }
  }
}
