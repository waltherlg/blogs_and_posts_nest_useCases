import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogActionResult } from "src/blogs/helpers/blogs.enum.action.result";
import { PostsRepository } from "src/posts/posts.repository";

export class DeletePostByIdFromUriCommand {
    constructor(public userId: string, public blogId: string, public postId: string){}
}

@CommandHandler(DeletePostByIdFromUriCommand)
export class DeletePostByIdFromUriUseCase implements ICommandHandler<DeletePostByIdFromUriCommand>{
constructor(private readonly postsRepository: PostsRepository){}
async execute(command: DeletePostByIdFromUriCommand): Promise<BlogActionResult> {
    const post = await this.postsRepository.getPostDBTypeById(command.postId)
    if(!post) return BlogActionResult.PostNotFound
    if(post.userId !== command.userId) return BlogActionResult.NotOwner
    const isDeleted = await this.postsRepository.deletePostById(command.postId)
    if (!isDeleted) return BlogActionResult.NotDeleted
    return BlogActionResult.Success
}
}