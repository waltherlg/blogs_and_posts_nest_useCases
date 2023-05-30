import { Body, Controller, HttpCode, Param, Put, Req, UseGuards } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { BanUserForBlogInputModelType } from "src/blogs/api/blogger.blogs.controller"
import { BanUserForSpecificBlogCommand } from "src/blogs/application/use-cases/blogger-ban-user-for-blog-use-case"
import { handleBlogOperationResult } from "src/blogs/helpers/blogs.enum.action.result"


@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
  ) {}

  @Put(':bannedUserId/ban')
  @HttpCode(204)
  async banUserForBlog(@Req() request, @Param('bannedUserId') bannedUserId: string, @Body() banUserDto: BanUserForBlogInputModelType ){
    const result = await this.commandBus.execute(new BanUserForSpecificBlogCommand(request.user.userId, bannedUserId, banUserDto))
    handleBlogOperationResult(result)
  }
}