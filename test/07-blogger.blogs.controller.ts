import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
export function testBloggerCrud() {
  describe('Blogger CRUD operation \"if all is ok\" (e2e). ', () => {
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    const notExistingId = new Types.ObjectId();

    let accessTokenUser1: any;
    let accessTokenUser2: any;


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

    it('00-00 auth/registration = 204 register user1', async () => {
        await request(app.getHttpServer())
          .post(`${endpoints.auth}/registration`)
          .send({
            login: 'user1',
            password: 'qwerty',
            email: 'ruslan@gmail-1.com',
          })
          .expect(204);
      });

      it('00-00 auth/registration = 204 register user2', async () => {
        await request(app.getHttpServer())
          .post(`${endpoints.auth}/registration`)
          .send({
            login: 'user2',
            password: 'qwerty',
            email: 'ruslan@gmail-2.com',
          })
          .expect(204);
      });
  
      it('00-00 login user1 = 204 login user1', async () => {
        const createResponse = await request(app.getHttpServer())
          .post(`${endpoints.auth}/login`)
          .send({
            loginOrEmail: 'user1',
            password: 'qwerty',
          })
          .expect(200);
        const createdResponse = createResponse.body;
        accessTokenUser1 = createdResponse.accessToken;
        expect(createdResponse).toEqual({
          accessToken: expect.any(String),
        });
      });

      it('00-00 login user2 = 204 login user2', async () => {
        const createResponse = await request(app.getHttpServer())
          .post(`${endpoints.auth}/login`)
          .send({
            loginOrEmail: 'user2',
            password: 'qwerty',
          })
          .expect(200);
        const createdResponse = createResponse.body;
        accessTokenUser2 = createdResponse.accessToken;
        expect(createdResponse).toEqual({
          accessToken: expect.any(String),
        });
      });


    it('01-02 blogger/blogs POST = 201 user1 create new blog', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.bloggerBlogs)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
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

    let blogIdUser2: any

    it('01-02 blogger/blogs POST = 201 user2 create new blog', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.bloggerBlogs)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send({
          name: 'BlogForUser2',
          description: 'description BlogForPosts user2',
          websiteUrl: 'https://www.someweb.com',
        })
        .expect(201);

      const createdResponseOfFirstBlog = testsResponse.body;
      blogIdUser2 = createdResponseOfFirstBlog.id;

      expect(createdResponseOfFirstBlog).toEqual({
        id: blogIdUser2,
        name: 'BlogForUser2',
        description: 'description BlogForPosts user2',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('01-05 blogger/blogs GET = 200 return users1 blogs with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.bloggerBlogs)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);
      const createdResponse = createResponse.body;
      
      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            name: 'BlogForPosts',
            description: 'description BlogForPosts',
            websiteUrl: 'https://www.someweb.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('01-05 blogger/blogs GET = 200 return users2 blogs with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.bloggerBlogs)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .expect(200);
      const createdResponse = createResponse.body;
      
      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            name: 'BlogForUser2',
            description: 'description BlogForPosts user2',
            websiteUrl: 'https://www.someweb.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('01-02 blogger/blogId/posts POST = 201 user 1 create new post', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}/${firstCreatedBlogId}/posts`)
        //.post(`${endpoints.posts}/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          title: 'newCreatedPost',
          shortDescription: 'newPostsShortDescription',
          content: 'some content',
        })
        .expect(201);

      const createdResponse = testsResponse.body;
      createdPostId = createdResponse.id;

      expect(createdResponse).toEqual({
        id: expect.any(String),
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

    it('01-02 blogger/blogs/blogId PUT = 201 user1 update blog', async () => {
      const testsResponse = await request(app.getHttpServer())
        .put(`${endpoints.bloggerBlogs}/${firstCreatedBlogId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          name: 'Updated Blog',
          description: 'Updated description',
          websiteUrl: 'https://www.updatedsomeweb.com',
        })
        .expect(204);
    });

    it('01-05 blogger/blogs GET = 200 return users1 updated blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.bloggerBlogs)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);
      const createdResponse = createResponse.body;
      
      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            name: 'Updated Blog',
            description: 'Updated description',
            websiteUrl: 'https://www.updatedsomeweb.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('01-06 blogger/blogs/blogsId/posts/postId UPDATE = 204 user1 update post', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.bloggerBlogs}/${firstCreatedBlogId}/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          title: 'updatedTitle',
          shortDescription: 'updatedShortDescription',
          content: 'updated some content',
        })
        .expect(204);
    });

    it('01-06 blogger/blogs/blogsId/posts/postId DELETE = 204 user1 delete post', async () => {
      const createResponse = await request(app.getHttpServer())
        .delete(`${endpoints.bloggerBlogs}/${firstCreatedBlogId}/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(204);
    });

    it('01-06 blogger/blogs/blogsId DELETE = 204 user1 delete blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .delete(`${endpoints.bloggerBlogs}/${firstCreatedBlogId}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(204);
    });

    it('01-05 blogger/blogs GET = 200 return users1 empty array after deleting blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.bloggerBlogs)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
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

  });
}