import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import { PostsRepository } from '../posts/posts.repository';
import { Injectable } from '@nestjs/common/decorators';
import { PostDocument } from '../posts/posts.types';

@Injectable()
export class LikeService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async updateCommentLike(
    userId: string,
    commentsId: string,
    status: string,
  ): Promise<boolean> {
    const isUserAlreadyLikeComment =
      await this.usersRepository.isUserAlreadyLikeComment(userId, commentsId);
    if (!isUserAlreadyLikeComment) {
      const createdAt = new Date();
      const isLikeAdded = await this.usersRepository.createCommentsLikeObject(
        userId,
        commentsId,
        createdAt,
        status,
      );
      const setCount = await this.commentsRepository.setCountCommentsLike(
        commentsId,
        status,
      );
      return isLikeAdded;
    }
    const likedComments = await this.usersRepository.getUsersLikedComments(
      userId,
    );
    if (!likedComments) return false;
    const comment = likedComments.find((c) => c.commentsId === commentsId);
    const currentStatus = comment ? comment.status : null;
    console.log('CurrentStatus ' + currentStatus);

    if (currentStatus !== status) {
      await this.usersRepository.updateCommentsLikeObject(
        userId,
        commentsId,
        status,
      );
      if (currentStatus === 'None' && status === 'Like') {
        await this.commentsRepository.increaseCommentsLikes(commentsId);
      }
      if (currentStatus === 'None' && status === 'Dislike') {
        await this.commentsRepository.increaseCommentsDislikes(commentsId);
      }
      if (currentStatus === 'Like' && status === 'None') {
        await this.commentsRepository.decreaseCommentsLikes(commentsId);
      }
      if (currentStatus === 'Dislike' && status === 'None') {
        await this.commentsRepository.decreaseCommentsDislikes(commentsId);
      }
      if (currentStatus === 'Like' && status === 'Dislike') {
        await this.commentsRepository.decreaseCommentsLikes(commentsId);
        await this.commentsRepository.increaseCommentsDislikes(commentsId);
      }
      if (currentStatus === 'Dislike' && status === 'Like') {
        await this.commentsRepository.decreaseCommentsDislikes(commentsId);
        await this.commentsRepository.increaseCommentsLikes(commentsId);
      }
      return true;
    } else return true;
  }
  async updatePostLike(
    userId: string,
    postsId: string,
    status: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.getUserDBTypeById(userId);
    if (!user) return false;
    const post: PostDocument = await this.postsRepository.getPostDBTypeById(
      postsId,
    );
    if (!post) return false;
    // const userPostIndex = post.likesCollection.findIndex(
    //   (post) => post.userId === userId,
    // );
    // console.log('userPostIndex ', userPostIndex);
    // const userPostStatus =
    //   userPostIndex !== -1 ? post.likesCollection[userPostIndex] : null;
    // console.log('userPostStatus ', userPostStatus);
    const userPostStatus = post.likesCollection.find(
      (post) => post.userId === userId,
    );
    if (!userPostStatus) {
      const createdAt = new Date();
      const newLike = {
        addedAt: createdAt.toISOString(),
        userId,
        login: user.login,
        status: status,
      };
      post.likesCollection.push(newLike);
      const result = await this.postsRepository.savePost(post);
      return result;
    }
    //post.likesCollection[userPostIndex].status = status;
    userPostStatus.status = status;
    post.markModified('likesCollection');
    // console.log(
    //   'post.likesCollection[userPostIndex] ',
    //   post.likesCollection[userPostIndex],
    // );
    const result = await this.postsRepository.savePost(post);
    return result;
  }
}
