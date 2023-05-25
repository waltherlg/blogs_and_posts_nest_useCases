import { CommentsRepository } from './../comments/comments.repository';
import { BlogsRepository } from 'src/blogs/blogs.repository';
import { UsersRepository } from './../users/users.repository';
import { Injectable } from "@nestjs/common";
import { PostsRepository } from 'src/posts/posts.repository';
import { UsersDevicesRepository } from 'src/usersDevices/usersDevicesRepository';

@Injectable()
export class BanService{
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly usersDevicesRepository: UsersDevicesRepository,
        private readonly blogsRepository: BlogsRepository,
        private readonly postsRepository: PostsRepository,
        private readonly commentsRepository: CommentsRepository,){}

        async banUser(userId: string){
            const user = await this.usersRepository.getUserDBTypeById(userId)
            user.isBanned = true
            user.save()

            await this.usersDevicesRepository.deleteAllUserDevicesById(userId)

            
        }
}