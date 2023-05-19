import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blogs.types';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { CheckService } from './other.services/check.service';
import { PostsRepository } from './posts/posts.repository';
import { Post, PostSchema } from './posts/posts.types';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { PostController } from './posts/posts.controller';
import { TestingService } from './all.data/test.service';
import { PostsService } from './posts/posts.service';
import { TestingController } from './all.data/testing.controller';
import { UsersService } from './users/users.service';
import { BcryptService } from './other.services/bcrypt.service';
import { UsersRepository } from './users/users.repository';
import { UsersController } from './users/users.controller';
import { User, UserSchema } from './users/users.types';
import { UsersQueryRepository } from './users/users.query.repository';
import { AuthService } from './auth/auth.service';
import { DTOFactory } from './helpers/DTO.factory';
import { AuthController } from './auth/auth.controller';
import { EmailManager } from './managers/email-manager';
import { EmailAdapter } from './adapters/email-adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { settings } from './settings';
import { UsersDevicesRepository } from './usersDevices/usersDevicesRepository';
import {
  UsersDevice,
  UsersDeviceSchema,
} from './usersDevices/users-devices.types';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RefreshTokenStrategy } from './auth/strategies/refreshToken.strategy';
import { UsersDeviceService } from './usersDevices/users-devices.service';
import { SecurityController } from './usersDevices/security.controller';
import { AnonymousStrategy } from './auth/strategies/anonymus.strategy';
import { Comment, CommentSchema } from './comments/comments.types';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { CommentsService } from './comments/comments.service';
import { CommentsControllers } from './comments/comments.controller';
import { LikeService } from './other.services/like.service';
import {
  CustomBlogIdValidator,
  CustomUrlValidator,
  LikeStatusValidator,
  TrimNotEmptyValidator,
} from './middlewares/validators';
import { TestRepository } from './all.data/test.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
const mongoUri = process.env.MONGO_URL;
const emailUser = process.env.MAIL_USER;
const emailPassword = process.env.MAIL_PASSWORD;
if (!emailUser || !emailPassword) {
  throw new Error('password or user for emailAdapter not found');
}

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    PassportModule,
    JwtModule.register({
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      },
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(mongoUri, { dbName: 'blogsAndPosts' }),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UsersDevice.name,
        schema: UsersDeviceSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostController,
    UsersController,
    AuthController,
    CommentsControllers,
    TestingController,
    SecurityController,
  ],
  providers: [
    AppService,
    BlogsService,
    PostsService,
    UsersService,
    UsersDeviceService,
    BcryptService,
    CheckService,
    TestingService,
    AuthService,
    CommentsService,
    LikeService,
    DTOFactory,
    EmailManager,
    EmailAdapter,
    TestRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    UsersRepository,
    UsersQueryRepository,
    UsersDevicesRepository,
    CommentsRepository,
    CommentsQueryRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    AnonymousStrategy,
    LikeStatusValidator,
    CustomUrlValidator,
    CustomBlogIdValidator,
    TrimNotEmptyValidator,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AuthService],
})
export class AppModule {}
