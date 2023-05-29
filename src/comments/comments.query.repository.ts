import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument, CommentTypeOutput, Comment } from './comments.types';
import { User, UserDocument } from '../users/users.types';
import { Injectable } from '@nestjs/common';
import { CommentsLikeType } from '../users/users.types';
import { CommentDBType } from './comments.types';
@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentTypeOutput | null> {
    if (!Types.ObjectId.isValid(commentId)) {
      return null;
    }
    const comment: CommentDocument = await this.commentModel.findById(
      commentId,
    );
    if (!comment || comment.isBanned === true) {
      return null;
    }
    const userCommentStatus = comment.likesCollection.find(
      (p) => p.userId === userId,
    );
    if (userCommentStatus) {
      comment.myStatus = userCommentStatus.status;
    }
    return comment.prepareCommentForOutput();
  }
  async getAllCommentsByPostId(postId: string, mergedQueryParams, userId?) {
    const commentsCount = await this.commentModel.countDocuments({
      parentType: 'post',
      parentId: postId,
      isBanned: { $ne: true }
    });
    const sortBy = mergedQueryParams.sortBy;
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = mergedQueryParams.pageNumber;
    const pageSize = mergedQueryParams.pageSize;

    const comments = await this.commentModel
      .find({
        parentType: 'post',
        parentId: postId,
        isBanned: { $ne: true }
      })
      .sort({ [sortBy]: this.sortByDesc(sortDirection) })
      .skip(this.skipPage(pageNumber, pageSize))
      .limit(+pageSize);

    let likedComment: Array<CommentsLikeType> = [];

    const outComments = comments.map((comment: CommentDocument) => {
      
      const userCommentStatus = comment.likesCollection.find(
        (p) => p.userId === userId,
      );
      if (userCommentStatus) {
        comment.myStatus = userCommentStatus.status;
      }
      return comment.prepareCommentForOutput();
    });
    const pageCount = Math.ceil(commentsCount / +pageSize);

    const outputComments = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: commentsCount,
      items: outComments,
    };
    return outputComments;
  }

  async getAllCommentsForBlogger(qwery, userId){

  }
  
  sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }

  skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
