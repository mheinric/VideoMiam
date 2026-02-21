import { describe, test, beforeEach, expect } from 'vitest';
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

describe('Channels management', () => {

  const agent = request.agent(app);
  beforeEach(async () => {
    await clearDB();
    await agent
      .post(`${baseUrl}/user/register`)
      .send({ email: "test@test.com", password: "test"})
      .expect('Content-Type', /json/)
      .expect(200);
  })

  test('Listing all channels', async () => {
    let res = await agent
      .post(`${baseUrl}/subscriptions/list`)
      .send({})
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.data).toStrictEqual([]);

    await agent
      .post(`${baseUrl}/subscriptions/add`)
      .send({ channelId: "UCVX13EuI29nIdTjbNfpS7NA" })
      .expect('Content-Type', /json/)
      .expect(200);

    res = await agent
      .post(`${baseUrl}/subscriptions/list`)
      .send({})
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.data).toStrictEqual([{
      IconURL: "https://yt3.ggpht.com/ytc/AIdro_lGAGuCJ-KNiimnVhTYd1ZOk0TY_HHQq973w2MnHow=s240-c-k-c0x00ffffff-no-rj",
      Id: 1,
      Favorite: 0,
      Kind: "Channel",
      Title: "Test Channel",
      YoutubeId: "UCVX13EuI29nIdTjbNfpS7NA",
    }]);
  });

  test('Marking channel as favorite', async () => {

    await agent
      .post(`${baseUrl}/subscriptions/add`)
      .send({ channelId: "UCVX13EuI29nIdTjbNfpS7NA" })
      .expect('Content-Type', /json/)
      .expect(200);

    await agent
      .post(`${baseUrl}/subscriptions/markFavorite`)
      .send({ channelId: 1, favorite: true })
      .expect('Content-Type', /json/)
      .expect(200);

    let res = await agent
      .post(`${baseUrl}/subscriptions/list`)
      .send({})
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.data[0].Favorite).toStrictEqual(1);
  });

});

describe('Multi-user support', () => {

  const agent1 = request.agent(app);
  const agent2 = request.agent(app);
  beforeEach(async () => {
    await clearDB();
    await agent1
      .post(`${baseUrl}/user/register`)
      .send({ email: "test@test.com", password: "test"})
      .expect('Content-Type', /json/)
      .expect(200);
    await agent2
      .post(`${baseUrl}/user/register`)
      .send({ email: "test2@test.com", password: "test"})
      .expect('Content-Type', /json/)
      .expect(200);
  })

  test('Listing all channels', async () => {

    await agent1
      .post(`${baseUrl}/subscriptions/add`)
      .send({ channelId: "UCVX13EuI29nIdTjbNfpS7NA" })
      .expect('Content-Type', /json/)
      .expect(200);

    let res = await agent2
      .post(`${baseUrl}/subscriptions/list`)
      .send({})
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.data).toStrictEqual([]);

  });

});