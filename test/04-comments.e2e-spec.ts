import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
export function testCommentsCrud() {
  describe('Comments CRUD (e2e)', () => {
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

    let firstCreatedBlogId: string;
    let createdPostId: string;

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
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

    it('00-00 registration = 204 register new user', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration`)
        .send({
          login: 'ruslan',
          password: 'qwerty',
          email: 'ruslan@gmail-1.com',
        })
        .expect(204);
    });

    let accessToken: any;

    it('00-00 login = 204 login user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send({
          loginOrEmail: 'ruslan',
          password: 'qwerty',
        })
        .expect(200);
      const createdResponse = createResponse.body;
      accessToken = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('01-02 /posts POST  = 201 create new comment by postId in params', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.posts}/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'some comment for testing',
        })
        .expect(201);

      const createdResponseOfFirstComment = testsResponse.body;

      expect(createdResponseOfFirstComment).toEqual({
        id: expect.any(String),
        content: 'some comment for testing',
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: 'ruslan',
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });
}
