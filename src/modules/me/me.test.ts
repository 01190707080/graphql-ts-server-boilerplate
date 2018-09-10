import axios from "axios";

import { User } from "../../models/user";
import createMongoDBConn from "../../utils/createMongoDBConn";

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

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`;

const meQuery = `
  {
    me {
      _id
      email
    }
  }
`;

describe("me", () => {
  test("return null if no cookie", async () => {
    const response = await axios.post(process.env.TEST_HOST as string, {
      query: meQuery
    });
    expect(response.data.data.me).toBeNull();
  });

  test("get current user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );

    expect(response.data.data).toEqual({
      me: {
        _id: userId.toString(),
        email
      }
    });
  });
});
