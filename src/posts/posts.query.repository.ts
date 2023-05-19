import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel } from '../models/types';
import { PostDocument, PostTypeOutput, Post } from './posts.types';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getPostById(postId, userId?): Promise<PostTypeOutput | null> {
    if (!Types.ObjectId.isValid(postId)) {
      return null;
    }
    const post: PostDocument = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }
    const userPostStatus = post.likesCollection.find(
      (p) => p.userId === userId,
    );
    if (userPostStatus) {
      post.myStatus = userPostStatus.status;
    }
    return post.preparePostForOutput();
  }

  async getAllPosts(mergedQueryParams, userId?) {
    const postCount = await this.postModel.countDocuments({});
    const posts = await this.postModel
      .find({})
      .skip(
        this.skipPage(mergedQueryParams.pageNumber, mergedQueryParams.pageSize),
      )
      .limit(+mergedQueryParams.pageSize)
      .sort({
        [mergedQueryParams.sortBy]: this.sortByDesc(
          mergedQueryParams.sortDirection,
        ),
      });

    const postsOutput = posts.map((post: PostDocument) => {
      const userPostStatus = post.likesCollection.find(
        (p) => p.userId === userId,
      );
      if (userPostStatus) {
        post.myStatus = userPostStatus.status;
      }
      return post.preparePostForOutput();
    });
    const pageCount = Math.ceil(postCount / +mergedQueryParams.pageSize);

    const outputPosts: PaginationOutputModel<PostTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: postCount,
      items: postsOutput,
    };
    return outputPosts;
  }

  async getAllPostsByBlogsId(
    mergedQueryParams,
    blogId,
    userId?,
  ): Promise<PaginationOutputModel<PostTypeOutput>> {
    const postCount = await this.postModel.countDocuments({ blogId: blogId });
    const posts = await this.postModel
      .find({ blogId: blogId })
      .skip(
        this.skipPage(mergedQueryParams.pageNumber, mergedQueryParams.pageSize),
      )
      .limit(+mergedQueryParams.pageSize)
      .sort({
        [mergedQueryParams.sortBy]: this.sortByDesc(
          mergedQueryParams.sortDirection,
        ),
      });

    const postsOutput = posts.map((post: PostDocument) => {
      const userPostStatus = post.likesCollection.find(
        (p) => p.userId === userId,
      );
      if (userPostStatus) {
        post.myStatus = userPostStatus.status;
      }
      return post.preparePostForOutput();
    });
    const pageCount = Math.ceil(postCount / +mergedQueryParams.pageSize);

    const outputPosts: PaginationOutputModel<PostTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: postCount,
      items: postsOutput,
    };
    return outputPosts;
  }

  sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }

  skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
