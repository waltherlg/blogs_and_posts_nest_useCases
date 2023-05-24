import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
export function testPostLikesCrud() {
  describe('Post Likes Crud CRUD operation \"if all is ok\" (e2e). ', () => {
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    let accessTokenUser1: any;
    let accessTokenUser2: any;
    let accessTokenUser3: any;
    let accessTokenUser4: any;
    let accessTokenUser5: any;
    

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

    let BlogId1User1: string;
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

    it('00-00 auth/registration = 204 register user3', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration`)
        .send({
          login: 'user3',
          password: 'qwerty',
          email: 'ruslan@gmail-3.com',
        })
        .expect(204);
    });

    it('00-00 login user3 = 204 login user3', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send({
          loginOrEmail: 'user3',
          password: 'qwerty',
        })
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser3 = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
    });

    
    it('00-00 auth/registration = 204 register user4', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration`)
        .send({
          login: 'user4',
          password: 'qwerty',
          email: 'ruslan@gmail-4.com',
        })
        .expect(204);
    });

    it('00-00 login user4 = 204 login user4', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send({
          loginOrEmail: 'user4',
          password: 'qwerty',
        })
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser4 = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
    });

    
    it('00-00 auth/registration = 204 register user5', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration`)
        .send({
          login: 'user5',
          password: 'qwerty',
          email: 'ruslan@gmail-5.com',
        })
        .expect(204);
    });

    it('00-00 login user5 = 204 login user5', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send({
          loginOrEmail: 'user5',
          password: 'qwerty',
        })
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser5 = createdResponse.accessToken;
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
      BlogId1User1 = createdResponseOfFirstBlog.id;

      expect(createdResponseOfFirstBlog).toEqual({
        id: BlogId1User1,
        name: 'BlogForPosts',
        description: 'description BlogForPosts',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('01-02 blogger/blogId/posts POST = 201 user1 create new post', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}/${BlogId1User1}/posts`)
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
        blogId: BlogId1User1,
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

    it('01-06 /posts/postId/like-status UPDATE = 204 like from user2', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 like from user3', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser3}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 Dislike from user4', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser4}`)
        .send({
          likeStatus: 'Dislike',
        })
        .expect(204);
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 Dislike from user5', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser5}`)
        .send({
          likeStatus: 'Dislike',
        })
        .expect(204);
    });

    it('01-07 /posts GET = 200 return post for unauth user with 2 like and 2 dislike', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${createdPostId}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        id: createdPostId,
        title: 'newCreatedPost',
        shortDescription: 'newPostsShortDescription',
        content: 'some content',
        blogId: expect.any(String),
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 2,
          dislikesCount: 2,
          myStatus: 'None',
          newestLikes: [
            {
              addedAt: expect.any(String),
              login: 'user3',
              userId: expect.any(String),
            },
            {
              addedAt: expect.any(String),
              login: 'user2',
              userId: expect.any(String),
            },
          ],
        },
      });
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 Like from user4', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser4}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 Like from user5', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser5}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);
    });

    it('01-07 /posts GET = 200 return post for auth user2 with 4 like and 3 last liked users', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${createdPostId}`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        id: createdPostId,
        title: 'newCreatedPost',
        shortDescription: 'newPostsShortDescription',
        content: 'some content',
        blogId: expect.any(String),
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 4,
          dislikesCount: 0,
          myStatus: 'Like',
          newestLikes: [
            {
              addedAt: expect.any(String),
              login: 'user5',
              userId: expect.any(String),
            },
            {
              addedAt: expect.any(String),
              login: 'user4',
              userId: expect.any(String),
            },
            {
              addedAt: expect.any(String),
              login: 'user3',
              userId: expect.any(String),
            },
          ],
        },
      });
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 Dislike from user5', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser5}`)
        .send({
          likeStatus: 'Dislike',
        })
        .expect(204);
    });

    it('01-06 /posts/postId/like-status UPDATE = 204 None from user2', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.posts}/${createdPostId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send({
          likeStatus: 'None',
        })
        .expect(204);
    });

    it('01-07 /posts GET = 200 return post for auth user5 with 2 like and 1 dislike, 2 last liked users, and my status Dislike', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${createdPostId}`)
        .set('Authorization', `Bearer ${accessTokenUser5}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        id: createdPostId,
        title: 'newCreatedPost',
        shortDescription: 'newPostsShortDescription',
        content: 'some content',
        blogId: expect.any(String),
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 2,
          dislikesCount: 1,
          myStatus: 'Dislike',
          newestLikes: [
            {
              addedAt: expect.any(String),
              login: 'user4',
              userId: expect.any(String),
            },
            {
              addedAt: expect.any(String),
              login: 'user3',
              userId: expect.any(String),
            },
          ],
        },
      });
    });


  });
}