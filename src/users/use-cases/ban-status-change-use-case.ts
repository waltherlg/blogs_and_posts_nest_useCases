import { CommentsRepository } from '../../comments/comments.repository';
import { BlogsRepository } from 'src/blogs/infrostracture/blogs.repository';
import { UsersRepository } from '../users.repository';
import { Injectable } from "@nestjs/common";
import { PostsRepository } from 'src/posts/posts.repository';
import { UsersDevicesRepository } from 'src/usersDevices/usersDevicesRepository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../sa.users.controller';


export class BanStatusChangeCommand {
    constructor(public userId, public banDto: BanUserInputModel){}
}

@CommandHandler(BanStatusChangeCommand)
export class BanStatusChangeUseCase implements ICommandHandler<BanStatusChangeCommand>{
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly usersDevicesRepository: UsersDevicesRepository,
        private readonly blogsRepository: BlogsRepository,
        private readonly postsRepository: PostsRepository,
        private readonly commentsRepository: CommentsRepository,){}

        async execute(command: BanStatusChangeCommand): Promise<boolean>{
            const userId = command.userId
            const isBanned = command.banDto.isBanned

            const user = await this.usersRepository.getUserDBTypeById(userId)
            
            if(user.isBanned === isBanned){
                return
            }
            if(isBanned === true){
                user.banReason = command.banDto.banReason
                user.banDate = new Date().toISOString()
                await this.usersDevicesRepository.deleteAllUserDevicesById(userId)
            }
            user.isBanned = isBanned
            const userBanResult = await this.usersRepository.saveUser(user)

            const postsBanResult = await this.postsRepository.setBanStatusForPosts(userId, isBanned)

            const commentBanResult = await this.commentsRepository.setBanStatusForComments(userId, isBanned)

            if (userBanResult && postsBanResult && commentBanResult){
                return true
            } else return false

            





            

            
        }
}