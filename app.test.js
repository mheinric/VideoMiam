import { describe, test, beforeEach } from 'vitest';
import request from 'supertest';
import app from './app.js';
import config from './config.js';
import { clearDB } from './services/db.js';

const baseUrl = config["base_url"];

describe('User management', () => {

  beforeEach(async () => {
    await clearDB();
  })

  test('Trying to login after registering', async () => {
    await request(app)
      .post(`${baseUrl}/user/register`)
      .send({ email: "test@test.com", password: "test"})
      .expect('Content-Type', /json/)
      .expect(200);

    await request(app)
      .post(`${baseUrl}/user/login`)
      .send({ email: "test@test.com", password: "test"})
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('Trying to login with incorrect email/password', async () => {
    await request(app)
      .post(`${baseUrl}/user/login`)
      .send({ email: "test@test.com", password: "test"})
      .expect('Content-Type', /json/)
      .expect(401);
  });
});