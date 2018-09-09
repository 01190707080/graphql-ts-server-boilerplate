import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";
import { User } from "../../models/user";

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const userAlreadyExists = await User.findOne({ email }, { _id: 1 });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: "already taken"
          }
        ];
      }

      const user = new User({
        email,
        password
      });
      await user.save();
      return null;
    }
  }
};
