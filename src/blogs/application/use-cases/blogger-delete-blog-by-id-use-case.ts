import { BlogActionResult } from 'src/blogs/helpers/blogs.enum.action.result';


import { BlogsRepository } from './../../blogs.repository';
import { Blog } from './../../blogs.types';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";


export class DeleteBlogByIdFromUriCommand {
    constructor(public blogId: string, public userId: string){}
}

@CommandHandler(DeleteBlogByIdFromUriCommand)
export class DeleteBlogByIdFromUriUseCase implements ICommandHandler<DeleteBlogByIdFromUriCommand>{
constructor(private readonly blogsRepository: BlogsRepository){}
async execute(command: DeleteBlogByIdFromUriCommand): Promise<BlogActionResult> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)  
    if(!blog) return BlogActionResult.BlogNotFound
    if(blog.userId !== command.userId) return BlogActionResult.NotOwner
    const isDeleted = await this.blogsRepository.deleteBlogById(command.blogId)
    if (!isDeleted) return BlogActionResult.NotDeleted
    return BlogActionResult.Success
}
}