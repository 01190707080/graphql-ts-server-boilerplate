import * as faker from "faker";

import { createTestConn } from "../../testUtils/createTestConn";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { User } from "../../models/user";
import { TestClient } from "../../utils/TestClient";

const email = faker.internet.email();
const password = faker.internet.password();

beforeAll(async () => {
  await createTestConn();
});

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("login", () => {
  test("email not found send back error", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(
      client,
      faker.internet.email(),
      "whatever",
      invalidLogin
    );
  });

  test("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);

    await loginExpectError(client, email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(client, email, "aslkdfjaksdljf", invalidLogin);

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
