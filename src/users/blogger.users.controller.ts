import { Body, Controller, HttpCode, Param, Put, Query, Req, UseGuards, Get, } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { BanUserForBlogInputModelType } from "src/blogs/api/blogger.blogs.controller"
import { BanUserForSpecificBlogCommand } from "src/blogs/application/use-cases/blogger-ban-user-for-blog-use-case"
import { handleBlogOperationResult } from "src/blogs/helpers/blogs.enum.action.result"
import { BlogsQueryRepository } from "src/blogs/infrostracture/blogs.query.repository"
import { BlogsRepository } from "src/blogs/infrostracture/blogs.repository"
import { RequestBannedUsersQueryModel, DEFAULT_BANNED_USERS_QUERY_PARAMS } from "src/models/types"
import { UsersQueryRepository } from "./users.query.repository"


@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Put(':bannedUserId/ban')
  @HttpCode(204)
  async banUserForBlog(@Req() request, @Param('bannedUserId') bannedUserId: string, @Body() banUserDto: BanUserForBlogInputModelType ){
    const result = await this.commandBus.execute(new BanUserForSpecificBlogCommand(request.user.userId, bannedUserId, banUserDto))
    handleBlogOperationResult(result)
  }

  @Get('blog/:blogId')
  @HttpCode(200)
  async getBannedUsersForCurrentBlog(@Req() request, @Param('blogId') blogId: string, @Query() queryParams: RequestBannedUsersQueryModel){
    const mergedQueryParams = { ...DEFAULT_BANNED_USERS_QUERY_PARAMS, ...queryParams }
    return await this.usersQueryRepository.getBannedUsersForCurrentBlog(request.user.userId, blogId, mergedQueryParams)
  }
}