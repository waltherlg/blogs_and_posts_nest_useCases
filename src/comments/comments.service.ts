import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UsersRepository } from '../users/users.repository';
import { Types } from 'mongoose';
import { CommentDBType } from './comments.types';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}
  async createComment(
    postId: string,
    content: string,
    userId: string,
  ): Promise<string> {
    const user = await this.usersRepository.getUserDBTypeById(userId);
    const CommentDTO = new CommentDBType(
      new Types.ObjectId(),
      'post',
      postId,
      content,
      userId!,
      user!.login,
      new Date().toISOString(),
      0,
      0,
      'None',
    );
    const createdCommentId = await this.commentsRepository.createComment(
      CommentDTO,
    );
    return createdCommentId;
  }
  async deleteCommentById(commentId): Promise<boolean> {
    const isDeleted = await this.commentsRepository.deleteCommentById(
      commentId,
    );
    return isDeleted;
  }

  async updateCommentById(
    commentId: string,
    content: string,
  ): Promise<boolean> {
    return await this.commentsRepository.updateCommentById(commentId, content);
  }
}
