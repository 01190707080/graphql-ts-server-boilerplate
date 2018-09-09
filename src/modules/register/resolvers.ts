import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { GQL } from "../../types/schema";
import { User } from "../../models/user";
import { formatYupError } from "../../utils/formatYupError";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
import {
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup.string().min(3, passwordNotLongEnough)
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;

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

      await createConfirmEmailLink(url, user.id, redis);

      return null;
    }
  }
};
