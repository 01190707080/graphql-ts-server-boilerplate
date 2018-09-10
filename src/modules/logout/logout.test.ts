import createMongoDBConn from "../../utils/createMongoDBConn";
import { User } from "../../models/user";
import { TestClient } from "../../utils/TestClient";

const email = "bob5@bob.com";
const password = "jlkajoioiqwe";

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

describe("logout", () => {
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
