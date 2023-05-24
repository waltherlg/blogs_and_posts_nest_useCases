import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "src/blogs/blogs.repository";
import { BlogActionResult } from "src/blogs/helpers/blogs.enum.action.result";

export class DeleteBlogByIdFromUriCommand {
    constructor(public blogId: string, public userId: string){}
  }
  
  @CommandHandler(DeleteBlogByIdFromUriCommand)
  export class DeleteBlogByIdFromUriUseCase implements ICommandHandler<DeleteBlogByIdFromUriCommand> {
    constructor(private readonly blogsRepository: BlogsRepository) {}
  
    async execute(
      command: DeleteBlogByIdFromUriCommand,
    ): Promise<BlogActionResult> {
      const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId);
      if(!blog) return BlogActionResult.BlogNotFound
      if(blog.userId !== command.userId) return BlogActionResult.NotOwner
      const result = await this.blogsRepository.deleteBlogById(command.blogId);
      if(result) {
        return BlogActionResult.Success
      } else { 
        return BlogActionResult.NotSaved
      }
  
    }
  }
  