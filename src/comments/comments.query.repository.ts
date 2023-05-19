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
    if (!comment) {
      return null;
    }
    if (userId && Types.ObjectId.isValid(userId)) {
      const user = await this.userModel.findById(userId);
      if (user) {
        const likedComment = user.likedComments.find(
          (e) => e.commentsId === commentId,
        );
        if (likedComment) {
          comment.myStatus = likedComment.status;
        }
      }
    }
    return comment.prepareCommentForOutput();
  }
  async getAllCommentsByPostId(postId: string, mergedQueryParams, userId?) {
    const commentsCount = await this.commentModel.countDocuments({
      $and: [{ parentType: 'post' }, { parentId: postId }],
    });
    console.log(postId, mergedQueryParams, userId);
    const sortBy = mergedQueryParams.sortBy;
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = mergedQueryParams.pageNumber;
    const pageSize = mergedQueryParams.pageSize;

    const comments = await this.commentModel
      .find({ $and: [{ parentType: 'post' }, { parentId: postId }] })
      .sort({ [sortBy]: this.sortByDesc(sortDirection) })
      .skip(this.skipPage(pageNumber, pageSize))
      .limit(+pageSize);

    let likedComment: Array<CommentsLikeType> = [];
    if (Types.ObjectId.isValid(userId)) {
      const user: UserDocument | null = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
      });
      if (user) {
        likedComment = user.likedComments;
      }
    }

    const outComments = comments.map((comment: CommentDocument) => {
      const currentCommentId = comment._id.toString();
      const isUserLikeIt = likedComment.find(
        (e) => e.commentsId === currentCommentId,
      );
      if (isUserLikeIt) {
        comment.myStatus = isUserLikeIt.status;
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
  sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }

  skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
