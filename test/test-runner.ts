import { testBlogCrud } from './01-blogs.e2e-spec';
import { testPostCrud } from './02-posts.e2e-spec';
import { testCommentsCrud } from './04-comments.e2e-spec';
import { testBloggerCrud } from './07-blogger.blogs.controller';
import { testPostLikesCrud } from './08-post-likes.operation.e2e-spec';
import { testCommentLikesCrud } from './09-comments-likes.operation.e2e-spec';
import { banCheckOperation } from './10-ban.check.operation.e2e-spec';

describe('End-to-End Tests', () => {
  //testBloggerCrud()
  //testPostLikesCrud()
  //testCommentLikesCrud()
  banCheckOperation()
});
