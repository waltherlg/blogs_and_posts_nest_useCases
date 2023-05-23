import { testBlogCrud } from './01-blogs.e2e-spec';
import { testPostCrud } from './02-posts.e2e-spec';
import { testCommentsCrud } from './04-comments.e2e-spec';
import { testBloggerCrud } from './07-blogger.blogs.controller';

describe('End-to-End Tests', () => {
  //testBlogCrud();
  //testPostCrud();
  //testCommentsCrud();
  testBloggerCrud()
});
