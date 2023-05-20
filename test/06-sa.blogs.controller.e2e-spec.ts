import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
export function testCommentsCrud() {
  describe('andpoints of SA blogs.controller (e2e)', () => {
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
