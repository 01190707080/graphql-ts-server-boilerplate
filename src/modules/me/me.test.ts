import { User } from "../../models/user";
import createMongoDBConn from "../../utils/createMongoDBConn";
import { TestClient } from "../../utils/TestClient";

let userId: string;
const email = "bob5@bob.com";
const password = "jlkajoioiqwe";

beforeAll(async () => {
  await createMongoDBConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  });
  userId = user._id;
});

describe("me", () => {
  test("return null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });

  test("get current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        _id: userId.toString(),
        email
      }
    });
  });
});
