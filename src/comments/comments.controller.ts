import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { CheckService } from '../other.services/check.service';
import { LikeService } from '../other.services/like.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import {
  BlogNotFoundException,
  CustomisableException,
  CustomNotFoundException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { th } from 'date-fns/locale';
import {
  IsString,
  Length,
  Validate,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import {
  LikeStatusValidator,
  StringTrimNotEmpty,
} from '../middlewares/validators';

export class UpdateCommentInputModelType {
  @StringTrimNotEmpty()
  @Length(20, 300)
  content: string;
}
export class SetLikeStatusForCommentInputModel {
  @StringTrimNotEmpty()
  @Validate(LikeStatusValidator)
  likeStatus: string;
}

@Controller('comments')
export class CommentsControllers {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly checkService: CheckService,
    private readonly likeService: LikeService,
  ) {}
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getCommentById(@Req() request, @Param('id') commentId: string) {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      request.user, //user = userId
    );
    if (!comment) {
      throw new CustomNotFoundException('comment');
    }
    return comment;
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteCommentById(@Req() request, @Param('id') commentId: string) {
    if (!(await this.checkService.isCommentExist(commentId))) {
      throw new CustomNotFoundException('comment');
    }
    if (
      !(await this.checkService.isUserOwnerOfComment(request.user, commentId))
    ) {
      throw new CustomisableException(
        'user is not owner',
        'cannot delete comments if you are not owner',
        403,
      );
    }
    const isCommentDeleted = await this.commentsService.deleteCommentById(
      commentId,
    );
    if (!isCommentDeleted) {
      throw new UnableException('comment deleting');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateCommentById(
    @Req() request,
    @Param('id') commentId: string,
    @Body() updateDTO: UpdateCommentInputModelType,
  ) {
    if (!(await this.checkService.isCommentExist(commentId))) {
      throw new CustomNotFoundException('comment');
    }
    if (
      !(await this.checkService.isUserOwnerOfComment(request.user, commentId))
    ) {
      throw new CustomisableException(
        'user is not owner',
        'cannot delete comments if you are not owner',
        403,
      );
    }
    const isUpdated = await this.commentsService.updateCommentById(
      commentId,
      updateDTO.content,
    );
    if (!isUpdated) {
      throw new UnableException('comment update');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async setLikeStatusForComment(
    @Req() request,
    @Param('id') commentId: string,
    @Body(new ValidationPipe({ transform: true }))
    likeStatus: SetLikeStatusForCommentInputModel,
  ) {
    const isCommentExist = await this.checkService.isCommentExist(commentId);
    if (!isCommentExist) {
      throw new CustomNotFoundException('comment');
    }
    const updateCommentLike = await this.likeService.updateCommentLike(
      request.user,
      commentId,
      likeStatus.likeStatus,
    );
    if (!updateCommentLike) {
      throw new UnableException('set like status');
    }
  }
}
