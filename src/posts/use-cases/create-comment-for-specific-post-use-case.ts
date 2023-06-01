import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { execute } from "auto";
import { BlogsRepository } from "src/blogs/infrostracture/blogs.repository";
import { PostsRepository } from "../posts.repository";
import { UsersRepository } from "src/users/users.repository";
import { CommentDBType } from "src/comments/comments.types";
import { Types } from "mongoose";
import { CommentsRepository } from "src/comments/comments.repository";
import { PostActionResult } from "../helpers/post.enum.action.result";

export class CreateCommentForSpecificPostCommand {
    constructor(public userId: string, public postId: string,
      public content: string){}
  }

@CommandHandler(CreateCommentForSpecificPostCommand)
export class CreateCommentForSpecificPostUseCase implements ICommandHandler<CreateCommentForSpecificPostCommand>{
    constructor(
      private readonly blogRepository: BlogsRepository,
      private readonly postRepository: PostsRepository,
      private readonly usersRepository: UsersRepository,
      private readonly commentsRepository: CommentsRepository,){}

async execute(command: CreateCommentForSpecificPostCommand)
  : Promise<PostActionResult | string> {
    const userId = command.userId
    const postId = command.postId
    const content = command.content

    const post = await this.postRepository.getPostDBTypeById(postId)
    if(!post){
      return PostActionResult.PostNotFound
    }
    const blog = await this.blogRepository.getBlogDBTypeById(post.blogId)
    if(!blog){
      return PostActionResult.BlogNotFound
    }
    const isUserBannedForBlog = blog.bannedUsers.some(user => user.id === userId)
    if (isUserBannedForBlog) {
      return PostActionResult.UserBannedForBlog
    }
    const user = await this.usersRepository.getUserDBTypeById(userId);

    const CommentDTO = new CommentDBType(
      new Types.ObjectId(),
      'post',
      postId,
      content,
      userId,
      user.login,
      false,
      new Date().toISOString(),
      0,
      0,
      'None',
      []
    );
    const createdCommentId = await this.commentsRepository.createComment(
      CommentDTO,
    );
    if(!createdCommentId){
      return PostActionResult.NotCreated
    }
    return createdCommentId;
  }
}