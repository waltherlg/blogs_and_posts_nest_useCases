import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from '../app.service';
import { RequestQueryParamsModel, DEFAULT_QUERY_PARAMS } from '../models/types';
import {
  Length,
  IsString,
  IsUrl,
  Validate,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { CheckService } from '../other.services/check.service';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostsQueryRepository } from './posts.query.repository';

import {
  CustomNotFoundException,
  PostNotFoundException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { BasicAuthGuard } from '../auth/guards/auth.guards';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from '../comments/comments.service';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { LikeService } from '../other.services/like.service';
import {
  BlogIdCustomValidator,
  LikeStatusValidator,
  StringTrimNotEmpty,
} from '../middlewares/validators';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentForSpecificPostCommand } from './use-cases/create-comment-for-specific-post-use-case';
import { handlePostActionResult } from './helpers/post.enum.action.result';

export class CreatePostInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  @BlogIdCustomValidator()
  blogId: string;
}

export class UpdatePostInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  @BlogIdCustomValidator()
  blogId: string;
}
export class CreateCommentInputModelType {
  @StringTrimNotEmpty()
  @Length(20, 300)
  content: string;
}
export class SetLikeStatusForPostInputModel {
  @StringTrimNotEmpty()
  @MaxLength(100)
  @Validate(LikeStatusValidator)
  likeStatus: string;
}
@Controller('posts')
export class PostController {
  constructor(
    private readonly appService: AppService,
    private readonly postsService: PostsService,
    private readonly checkService: CheckService,
    private readonly commentService: CommentsService,
    private readonly likeService: LikeService,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}
  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async createPost(@Body() postCreateInputModel: CreatePostInputModelType) {
  //   const newPostId = await this.postsService.createPost(postCreateInputModel);
  //   const newPost = await this.postsQueryRepository.getPostById(newPostId);
  //   if (!newPost) {
  //     throw new UnableException('post creating');
  //   }
  //   return newPost;
  // }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getPostById(@Req() request, @Param('id') postId: string) {
    const post = await this.postsQueryRepository.getPostById(
      postId,
      request.user.userId,
    );
    if (!post) {
      throw new PostNotFoundException();
    }
    return post;
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePostById(
    @Param('id') postId: string,
    @Body() postUpdateInputModel: UpdatePostInputModelType,
  ) {
    if (!(await this.checkService.isPostExist(postId))) {
      throw new PostNotFoundException();
    }
    const result = await this.postsService.updatePostById(
      postId,
      postUpdateInputModel,
    );
    if (!result) {
      throw new UnableException('post updating');
    }
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Param('id') postId: string) {
    if (!(await this.checkService.isPostExist(postId))) {
      throw new PostNotFoundException();
    }
    const result = await this.postsService.deletePostById(postId);
    if (!result) {
      throw new UnableException('post deleting');
    }
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getAllPosts(
    @Req() request,
    @Query() queryParams: RequestQueryParamsModel,
  ) {
    const mergedQueryParams = { ...DEFAULT_QUERY_PARAMS, ...queryParams };
    return await this.postsQueryRepository.getAllPosts(
      mergedQueryParams,
      request.user.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createCommentByPostId(
    @Req() request,
    @Param('id') postId: string,
    @Body() content: CreateCommentInputModelType,
  ) {
    const resultOrCommentId = await this.commandBus.execute(new CreateCommentForSpecificPostCommand(request.user.userId, postId, content.content))
    handlePostActionResult(resultOrCommentId)
    const createdComment = await this.commentsQueryRepository.getCommentById(resultOrCommentId)
    return createdComment
  }
  
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/comments')
  async getAllCommentsByPostId(
    @Req() request,
    @Param('id') postId: string,
    @Query() queryParams: RequestQueryParamsModel,
  ) {
    if (!(await this.checkService.isPostExist(postId))) {
      throw new CustomNotFoundException('post');
    }
    const mergedQueryParams = { ...DEFAULT_QUERY_PARAMS, ...queryParams };
    console.log('mergedQueryParams ', mergedQueryParams);
    return await this.commentsQueryRepository.getAllCommentsByPostId(
      postId,
      mergedQueryParams,
      request.user.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async setLikeStatusForPost(
    @Req() request,
    @Param('id') postId: string,
    @Body()
    likeStatus: SetLikeStatusForPostInputModel,
  ) {
    if (!(await this.checkService.isPostExist(postId))) {
      throw new CustomNotFoundException('post');
    }
    const isPostLiked = await this.likeService.updatePostLike(
      request.user.userId,
      postId,
      likeStatus.likeStatus,
    );
    if (!isPostLiked) {
      throw new UnableException('set like status for post');
    }
  }
}
