import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
export function testPostCrud() {
  describe('PostsController (e2e)', () => {
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    const notExistingId = new Types.ObjectId();

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });
    afterAll(async () => {
      await app.close();
    });

    let firstCreatedBlogId: string;
    let createdPostId: string;

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
    });

    it('01-01 /posts GET = 200 return empty array with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.posts)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('01-02 /blogs POST  = 201 create new blog for testing posts', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.blogs)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          name: 'BlogForPosts',
          description: 'description BlogForPosts',
          websiteUrl: 'https://www.someweb.com',
        })
        .expect(201);

      const createdResponseOfFirstBlog = testsResponse.body;
      firstCreatedBlogId = createdResponseOfFirstBlog.id;

      expect(createdResponseOfFirstBlog).toEqual({
        id: firstCreatedBlogId,
        name: 'BlogForPosts',
        description: 'description BlogForPosts',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('01-02 /posts POST  = 201 create new post if all is OK', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.posts)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          title: 'newCreatedPost',
          shortDescription: 'newPostsShortDescription',
          content: 'some content',
          blogId: firstCreatedBlogId,
        })
        .expect(201);

      const createdResponseOfFirstPost = testsResponse.body;
      createdPostId = createdResponseOfFirstPost.id;

      expect(createdResponseOfFirstPost).toEqual({
        id: createdPostId,
        title: 'newCreatedPost',
        shortDescription: 'newPostsShortDescription',
        content: 'some content',
        blogId: firstCreatedBlogId,
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('01-05 /posts GET = 200 return all Posts with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.posts)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: createdPostId,
            title: 'newCreatedPost',
            shortDescription: 'newPostsShortDescription',
            content: 'some content',
            blogId: firstCreatedBlogId,
            blogName: 'BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });

    it('01-06 /posts UPDATE = 204', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          title: 'updatedTitle',
          shortDescription: 'updatedShortDescription',
          content: 'updated some content',
        })
        .expect(204);
    });

    it('01-07 /posts GET = 200 return UPDATED post by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${createdPostId}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        id: createdPostId,
        title: 'updatedTitle',
        shortDescription: 'updatedShortDescription',
        content: 'updated some content',
        blogId: firstCreatedBlogId,
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('01-08 /posts DELETE = 204', async () => {
      const createResponse = await request(app.getHttpServer())
        .delete(`${endpoints.posts}/${createdPostId}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(204);
    });

    it('01-09 /posts GET = 404 not found deleted posts', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${createdPostId}`)
        .expect(404);
    });

    let secondCreatedPostsId: string;

    it('01-10 /blogs POST = 201 create new post, using blogs controller', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.blogs}/${firstCreatedBlogId}/posts`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          title: 'PostByBlogsId',
          shortDescription: 'newPosts created by BlogsController',
          content: 'some content',
        })
        .expect(201);

      const createdResponseOfSecondPost = testsResponse.body;
      secondCreatedPostsId = createdResponseOfSecondPost.id;

      expect(createdResponseOfSecondPost).toEqual({
        id: secondCreatedPostsId,
        title: 'PostByBlogsId',
        shortDescription: 'newPosts created by BlogsController',
        content: 'some content',
        blogId: firstCreatedBlogId,
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    let thirdCreatedPostsId: string;

    it('01-11 /blogs POST = 201 create second post, using blogs controller', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.blogs}/${firstCreatedBlogId}/posts`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          title: 'thirdPostByBlogsId',
          shortDescription: 'third Posts created by BlogsController',
          content: 'some content',
        })
        .expect(201);

      const createdResponseOfThirdPost = testsResponse.body;
      thirdCreatedPostsId = createdResponseOfThirdPost.id;

      expect(createdResponseOfThirdPost).toEqual({
        id: thirdCreatedPostsId,
        title: 'thirdPostByBlogsId',
        shortDescription: 'third Posts created by BlogsController',
        content: 'some content',
        blogId: firstCreatedBlogId,
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('01-12 /posts GET = 200 return two Posts with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.posts)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: thirdCreatedPostsId,
            title: 'thirdPostByBlogsId',
            shortDescription: 'third Posts created by BlogsController',
            content: 'some content',
            blogId: firstCreatedBlogId,
            blogName: 'BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: secondCreatedPostsId,
            title: 'PostByBlogsId',
            shortDescription: 'newPosts created by BlogsController',
            content: 'some content',
            blogId: firstCreatedBlogId,
            blogName: 'BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });

    let secondCreatedBlogId: string;

    it('01-13 /blogs POST  = 201 create second blog for testing posts', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.blogs)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          name: 'second BlogForPosts',
          description: 'second description BlogForPosts',
          websiteUrl: 'https://www.someweb.com',
        })
        .expect(201);

      const createdResponseOfSecondBlog = testsResponse.body;
      secondCreatedBlogId = createdResponseOfSecondBlog.id;

      expect(createdResponseOfSecondBlog).toEqual({
        id: secondCreatedBlogId,
        name: 'second BlogForPosts',
        description: 'second description BlogForPosts',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    let fourthCreatedPostsId: string;

    it('01-14 /blogs POST = 201 create fourth post, using blogs controller(second blog)', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.blogs}/${secondCreatedBlogId}/posts`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          title: 'fourthPostByBlogsId',
          shortDescription: 'fourth Posts created by second BlogsId',
          content: 'some content',
        })
        .expect(201);

      const fourthResponseOfCreatedPost = testsResponse.body;
      fourthCreatedPostsId = fourthResponseOfCreatedPost.id;

      expect(fourthResponseOfCreatedPost).toEqual({
        id: fourthCreatedPostsId,
        title: 'fourthPostByBlogsId',
        shortDescription: 'fourth Posts created by second BlogsId',
        content: 'some content',
        blogId: secondCreatedBlogId,
        blogName: 'second BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('01-15 /posts POST  = 201 make a fifth post for the second blog', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.posts)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          title: 'fifthCreatedPost',
          shortDescription: 'fifth Posts for the second blog',
          content: 'some content',
          blogId: secondCreatedBlogId,
        })
        .expect(201);

      const createdResponseOfFirstPost = testsResponse.body;
      createdPostId = createdResponseOfFirstPost.id;

      expect(createdResponseOfFirstPost).toEqual({
        id: createdPostId,
        title: 'fifthCreatedPost',
        shortDescription: 'fifth Posts for the second blog',
        content: 'some content',
        blogId: secondCreatedBlogId,
        blogName: 'second BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('01-16 /posts GET = 200 return four Posts with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.posts)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          {
            id: createdPostId,
            title: 'fifthCreatedPost',
            shortDescription: 'fifth Posts for the second blog',
            content: 'some content',
            blogId: secondCreatedBlogId,
            blogName: 'second BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: fourthCreatedPostsId,
            title: 'fourthPostByBlogsId',
            shortDescription: 'fourth Posts created by second BlogsId',
            content: 'some content',
            blogId: secondCreatedBlogId,
            blogName: 'second BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: thirdCreatedPostsId,
            title: 'thirdPostByBlogsId',
            shortDescription: 'third Posts created by BlogsController',
            content: 'some content',
            blogId: firstCreatedBlogId,
            blogName: 'BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: secondCreatedPostsId,
            title: 'PostByBlogsId',
            shortDescription: 'newPosts created by BlogsController',
            content: 'some content',
            blogId: firstCreatedBlogId,
            blogName: 'BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });

    it('01-17 /posts GET = 200 return two Posts for second Blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}/${secondCreatedBlogId}/posts`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: createdPostId,
            title: 'fifthCreatedPost',
            shortDescription: 'fifth Posts for the second blog',
            content: 'some content',
            blogId: secondCreatedBlogId,
            blogName: 'second BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
          {
            id: fourthCreatedPostsId,
            title: 'fourthPostByBlogsId',
            shortDescription: 'fourth Posts created by second BlogsId',
            content: 'some content',
            blogId: secondCreatedBlogId,
            blogName: 'second BlogForPosts',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });
  });
}
