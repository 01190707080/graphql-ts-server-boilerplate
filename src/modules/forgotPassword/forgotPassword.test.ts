import * as Redis from "ioredis";

import { TestClient } from "../../utils/TestClient";
import createMongoDBConn from "../../utils/createMongoDBConn";
import { User } from "../../models/user";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";

export const redis = new Redis();
const email = "bob5@bob.com";
const password = "jlkajoioiqwe";
const newPassword = "qowuieoiqwueoq";

let userId: string;
beforeAll(async () => {
  await createMongoDBConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  });
  userId = user._id;
});

describe("forgot password", () => {
  test("make sure it works", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const url = await createForgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});
