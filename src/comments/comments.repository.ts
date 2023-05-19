import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument, Comment, CommentDBType } from './comments.types';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async createComment(commentDTO: CommentDBType): Promise<string> {
    const comment = new this.commentModel(commentDTO);
    await comment.save();
    return comment._id.toString();
  }

  async getCommentDbTypeById(commentId) {
    if (!Types.ObjectId.isValid(commentId)) {
      return null;
    }
    const comment: CommentDocument = await this.commentModel.findById(
      commentId,
    );
    if (!comment) {
      return null;
    }
    return comment;
  }
  async deleteCommentById(commentId): Promise<boolean> {
    if (!Types.ObjectId.isValid(commentId)) {
      return false;
    }
    const isDeleted = await this.commentModel.deleteOne({ _id: commentId });
    return !!isDeleted;
  }

  async updateCommentById(commentId, content): Promise<boolean> {
    if (!Types.ObjectId.isValid(commentId)) {
      return false;
    }
    const comment: CommentDocument = await this.commentModel.findById(
      commentId,
    );
    if (!comment) {
      return false;
    }
    comment.content = content;
    const result = await comment.save();
    return !!result;
  }

  async setCountCommentsLike(commentsId: string, status: string) {
    if (!Types.ObjectId.isValid(commentsId)) {
      return false;
    }
    const comment = await this.commentModel.findById(commentsId);
    if (!comment) return false;
    if (status === 'Like') {
      comment.likesCount++;
    }
    if (status === 'Dislike') {
      comment.dislikesCount++;
    }
    await comment.save();
    return true;
  }

  async increaseCommentsLikes(commentsId: string) {
    if (!Types.ObjectId.isValid(commentsId)) {
      return false;
    }
    const comment = await this.commentModel.findById(commentsId);
    if (!comment) return false;
    comment.likesCount += 1;
    const result = await comment.save();
    return !!result;
  }

  async decreaseCommentsLikes(commentsId: string) {
    if (!Types.ObjectId.isValid(commentsId)) {
      return false;
    }
    const comment = await this.commentModel.findById(commentsId);
    if (!comment) return false;
    comment.likesCount -= 1;
    const result = await comment.save();
    return !!result;
  }

  async increaseCommentsDislikes(commentsId: string) {
    if (!Types.ObjectId.isValid(commentsId)) {
      return false;
    }
    const comment = await this.commentModel.findById(commentsId);
    if (!comment) return false;
    comment.dislikesCount += 1;
    const result = await comment.save();
    return !!result;
  }

  async decreaseCommentsDislikes(commentsId: string) {
    if (!Types.ObjectId.isValid(commentsId)) {
      return false;
    }
    const comment = await this.commentModel.findById(commentsId);
    if (!comment) return false;
    comment.dislikesCount -= 1;
    const result = await comment.save();
    return !!result;
  }
}
