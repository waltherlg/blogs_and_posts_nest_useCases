import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';

export function testBlogCrud() {
  describe('BlogsController (e2e)', () => {
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

    let createdBlogId: string;

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
    });

    it('01-01 /blogs GET = 200 return empty array with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.blogs)
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

    it('01-02 /blogs POST  = 201 create new blog if all is OK', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.blogs)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          name: 'createdBlog',
          description: 'newDescription',
          websiteUrl: 'https://www.someweb.com',
        })
        .expect(201);

      const createdResponseOfFirstBlog = testsResponse.body;
      createdBlogId = createdResponseOfFirstBlog.id;

      expect(createdResponseOfFirstBlog).toEqual({
        id: createdBlogId,
        name: 'createdBlog',
        description: 'newDescription',
        websiteUrl: 'https://www.someweb.com',
        createdAt: createdResponseOfFirstBlog.createdAt,
        isMembership: false,
      });
    });

    it('01-03 /blogs GET = 200 return blog by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}/${createdBlogId}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        id: createdBlogId,
        name: 'createdBlog',
        description: 'newDescription',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('01-05 /blogs POST  = 201 create one more new blog if all is OK', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.blogs)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          name: 'createdBlog2',
          description: 'newDescription2',
          websiteUrl: 'https://www.someweb2.com',
        })
        .expect(201);

      const createdResponse = testsResponse.body;

      expect(createdResponse).toEqual({
        id: expect.any(String),
        name: 'createdBlog2',
        description: 'newDescription2',
        websiteUrl: 'https://www.someweb2.com',
        createdAt: createdResponse.createdAt,
        isMembership: false,
      });
    });

    it('01-05 /blogs GET = 200 return all blogs with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.blogs)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            name: 'createdBlog2',
            description: 'newDescription2',
            websiteUrl: 'https://www.someweb2.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
          {
            id: expect.any(String),
            name: 'createdBlog',
            description: 'newDescription',
            websiteUrl: 'https://www.someweb.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });

    it('01-06 /blogs UPDATE = 204', async () => {
      console.log(createdBlogId);
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.blogs}/${createdBlogId}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          name: 'updatedBlog2',
          description: 'updatedDescription2',
          websiteUrl: 'https://www.updatedsomeweb2.com',
        })
        .expect(204);
    });

    it('01-07 /blogs GET = 200 return UPDATED blog by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}/${createdBlogId}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        id: createdBlogId,
        name: 'updatedBlog2',
        description: 'updatedDescription2',
        websiteUrl: 'https://www.updatedsomeweb2.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('01-08 /blogs DELETE = 204', async () => {
      const createResponse = await request(app.getHttpServer())
        .delete(`${endpoints.blogs}/${createdBlogId}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(204);
    });

    it('01-09 /blogs GET = 404 not found deleted blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}/${createdBlogId}`)
        .expect(404);
    });

    it('01-05 /blogs GET = 200 return ONE blog with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.blogs)
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
            name: 'createdBlog2',
            description: 'newDescription2',
            websiteUrl: 'https://www.someweb2.com',
            createdAt: expect.any(String),
            isMembership: false,
          },
        ],
      });
    });
  });
}
