import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserTypeOutput } from './users.types';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel, RequestBannedUsersQueryModel } from '../models/types';
import { BlogDocument, Blog } from 'src/blogs/blogs.types';
import { PipelineStage } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  @InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getUserById(userId): Promise<UserTypeOutput | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    const user: UserDocument = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }
    return user.prepareUserForOutput();
  }

  async getAllUsers(
    mergedQueryParams,
  ): Promise<PaginationOutputModel<UserTypeOutput>> {


    //let usersCount = await usersCollection.countDocuments({})

const query = {
  $or: [
    { login: new RegExp(mergedQueryParams.searchLoginTerm, 'gi') },
    { email: new RegExp(mergedQueryParams.searchEmailTerm, 'gi') },
  ],
};

if (mergedQueryParams.banStatus === 'banned') {
  query['isBanned'] = true;
} else if (mergedQueryParams.banStatus === 'notBanned') {
  query['isBanned'] = false;
}
    const usersCount = await this.userModel.countDocuments(query);


const users = await this.userModel.find(query)
.sort({
        [mergedQueryParams.sortBy]: this.sortByDesc(
          mergedQueryParams.sortDirection,
        ),
      })
      .skip(
        this.skipPage(mergedQueryParams.pageNumber, mergedQueryParams.pageSize),
      )
      .limit(+mergedQueryParams.pageSize);

    const outUsers = users.map((user) => {
      return user.prepareUserForOutput();
    });
    const pageCount = Math.ceil(usersCount / +mergedQueryParams.pageSize);

    const outputUsers: PaginationOutputModel<UserTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: usersCount,
      items: outUsers,
    };
    return outputUsers;
  }

  async getBannedUsersForCurrentBlog(userId: string, blogId: string, mergedQueryParams: RequestBannedUsersQueryModel){
    const blog = await this.blogModel.findById(blogId)
    const aggregationPipeline: PipelineStage[] = [
      { $match: { _id: blogId } }, // Фильтруем только нужный блог
      { $unwind: "$bannedUsers" }, // Развертываем массив bannedUsers
      { $sort: { [mergedQueryParams.sortBy]: this.sortByDesc(mergedQueryParams.sortDirection) } }, // Сортируем результаты
      { $skip: this.skipPage(mergedQueryParams.pageNumber, mergedQueryParams.pageSize) }, // Пропускаем результаты
      { $limit: +mergedQueryParams.pageSize }, // Ограничиваем количество результатов
      { $group: { _id: "$_id", bannedUsers: { $push: "$bannedUsers" } } }, // Группируем результаты по блогу
    ];
    
    const [result] = await this.blogModel.aggregate(aggregationPipeline);
    const users = result ? result.bannedUsers : [];
    const usersCount = users.length;  
  }

  sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }

  skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
