import * as faker from "faker";
import * as Redis from "ioredis";
import fetch from "node-fetch";

import { createTestConn } from "../../../testUtils/createTestConn";
import { User, IUserModel } from "../../../models/user";
import { createConfirmEmailLink } from "./createConfirmEmailLink";

let userId = "";
const redis = new Redis();

beforeAll(async () => {
  await createTestConn();
  const user = await User.create({
    email: faker.internet.email(),
    password: faker.internet.password()
  });
  userId = user._id;
});

test("Make sure it confirms user and clears key in redis", async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual("ok");
  const user = await User.findOne({ _id: userId });
  expect((user as IUserModel).confirmed).toBeTruthy();
  const chunks = url.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
