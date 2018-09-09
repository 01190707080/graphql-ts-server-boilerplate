import { request } from "graphql-request";

import { host } from "./constants";
import User from "../models/user";
import createMongoDBConn from "../utils/createMongoDBConn";

beforeAll(async () => {
  await createMongoDBConn();
});

const email = "test@gamil.com";
const password = "jalksdf";

const mutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`;

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ email });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
