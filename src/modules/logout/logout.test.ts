import axios from "axios";
import createMongoDBConn from "../../utils/createMongoDBConn";
import { User } from "../../models/user";

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

const logoutMutation = `
  mutation {
    logout
  }
`;

describe("logout", () => {
  test("test logging out a user", async () => {
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

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
      },
      {
        withCredentials: true
      }
    );

    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    );

    expect(response2.data.data.me).toBeNull();
  });
});
