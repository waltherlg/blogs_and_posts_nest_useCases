import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDBType, BlogDocument, BlogTypeOutput } from '../blogs.types';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel } from '../../models/types';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlogById(blogId): Promise<BlogTypeOutput | null> {
    if (!Types.ObjectId.isValid(blogId)) {
      return null;
    }
    const blog: BlogDocument = await this.blogModel.findById(blogId);
    if (!blog) {
      return null;
    }
    return blog.prepareBlogForOutput();
  }

  async getAllBlogs(mergedQueryParams) {
    const blogsCount = await this.blogModel.countDocuments({
      name: new RegExp(mergedQueryParams.searchNameTerm, 'gi'),
    });
    let blogs;
    if (mergedQueryParams.searchNameTerm !== '') {
      blogs = await this.blogModel
        .find({ name: new RegExp(mergedQueryParams.searchNameTerm, 'gi') })
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    } else {
      blogs = await this.blogModel
        .find({})
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    }
    const blogsOutput = blogs.map((blog: BlogDocument) => {
      return blog.prepareBlogForOutput();
    });
    const pageCount = Math.ceil(blogsCount / +mergedQueryParams.pageSize);

    const outputBlogs: PaginationOutputModel<BlogTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: blogsCount,
      items: blogsOutput,
    };
    return outputBlogs;
  }

  
  async getAllBlogsForSa(mergedQueryParams) {
    const blogsCount = await this.blogModel.countDocuments({
      name: new RegExp(mergedQueryParams.searchNameTerm, 'gi'),
    });
    let blogs;
    if (mergedQueryParams.searchNameTerm !== '') {
      blogs = await this.blogModel
        .find({ name: new RegExp(mergedQueryParams.searchNameTerm, 'gi') })
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    } else {
      blogs = await this.blogModel
        .find({})
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    }
    const blogsOutput = blogs.map((blog: BlogDocument) => {
      return blog.prepareBlogForSaOutput();
    });
    const pageCount = Math.ceil(blogsCount / +mergedQueryParams.pageSize);

    const outputBlogs: PaginationOutputModel<BlogTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: blogsCount,
      items: blogsOutput,
    };
    return outputBlogs;
  }

  async getAllBlogsForCurrentUser(mergedQueryParams, userId) {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = mergedQueryParams;
    const searchQuery = {
      userId: userId,
      ...(searchNameTerm !== '' ? { name: new RegExp(searchNameTerm, 'gi') } : {})
    };
  
    const [blogsCount, blogs] = await Promise.all([
      this.blogModel.countDocuments(searchQuery),
      this.blogModel
        .find(searchQuery)
        .skip(this.skipPage(pageNumber, pageSize))
        .limit(+pageSize)
        .sort({ [sortBy]: this.sortByDesc(sortDirection) })
    ]);
    
    const blogsOutput = blogs.map(blog => blog.prepareBlogForOutput());
    const pageCount = Math.ceil(blogsCount / +pageSize);
  
    const outputBlogs = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: blogsCount,
      items: blogsOutput
    };
  
    return outputBlogs;
  }
  
  private sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }
  
  private skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
