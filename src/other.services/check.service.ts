import { BlogsRepository } from '../blogs/infrostracture/blogs.repository';
import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersDevicesRepository } from '../usersDevices/usersDevicesRepository';
@Injectable()
export class CheckService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersDeviceRepository: UsersDevicesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async isBlogExist(blogId): Promise<boolean> {
    const isExist = await this.blogsRepository.isBlogExist(blogId);
    return isExist;
  }

  async isPostExist(postId): Promise<boolean> {
    const post = await this.postsRepository.getPostDBTypeById(postId);
    return !!post;
  }

  async isUserExist(userId): Promise<boolean> {
    const user = await this.usersRepository.getUserDBTypeById(userId);
    return !!user;
  }

  async isConfirmationCodeExist(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);
    return !!user;
  }

  async isEmailConfirmed(email: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    return user!.isConfirmed;
  }

  async isEmailExist(email: string): Promise<boolean> {
    const emailExist = await this.usersRepository.findUserByLoginOrEmail(email);
    return !!emailExist;
  }

  async isLoginExist(login: string): Promise<boolean> {
    const emailExist = await this.usersRepository.findUserByLoginOrEmail(login);
    return !!emailExist;
  }

  async isCodeConfirmed(code: string): Promise<boolean> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);
    return user!.isConfirmed;
  }

  async isRecoveryCodeExist(code: string): Promise<boolean> {
    const isExist = await this.usersRepository.getUserByPasswordRecoveryCode(
      code,
    );
    return !!isExist;
  }

  async isCommentExist(commentId): Promise<boolean> {
    const isExist = await this.commentsRepository.getCommentDbTypeById(
      commentId,
    );
    return !!isExist;
  }
  async isUserOwnerOfComment(userId, commentId): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentDbTypeById(
      commentId,
    );
    if (!comment || comment.userId !== userId) {
      return false;
    } else return true;
  }

  async isUserOwnerOfDevice(userId, deviceId): Promise<boolean> {
    const result = await this.usersDeviceRepository.getDeviceByUsersAndDeviceId(
      userId,
      deviceId,
    );
    return !!result;
  }

  async isUserDeviceExist(deviceId): Promise<boolean> {
    const userDevice = await this.usersDeviceRepository.getUserDeviceById(
      deviceId,
    );
    return !!userDevice;
  }

  async isUserOwnerOfBlog(userId, blogId): Promise<boolean>{
    const blog = await this.blogsRepository.getBlogDBTypeById(blogId)
    if (!blog || blog.userId !== userId) {
      return false 
    } else {
      return true
    }
  }
}
