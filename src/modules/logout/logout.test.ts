import * as faker from "faker";

import { createTestConn } from "../../testUtils/createTestConn";
import { User } from "../../models/user";
import { TestClient } from "../../utils/TestClient";

const email = faker.internet.email();
const password = faker.internet.password();

let userId: string;
beforeAll(async () => {
  await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  });
  userId = user._id;
});

describe("logout", () => {
  test("multiple sessions", async () => {
    // computer 1
    const sess1 = new TestClient(process.env.TEST_HOST as string);
    // computer 2
    const sess2 = new TestClient(process.env.TEST_HOST as string);

    await sess1.login(email, password);
    await sess2.login(email, password);
    expect(await sess1.me()).toEqual(await sess2.me());
    await sess1.logout();
    expect(await sess1.me()).toEqual(await sess2.me());
  });

  test("test logging out a user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        _id: userId.toString(),
        email
      }
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});
