import { ResolverMap } from "./types/graphql-utils";
import { GQL } from "./types/schema";
import User from "./models/user";

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const user = new User({
        email,
        password
      });
      await user.save();
      return true;
    }
  }
};
