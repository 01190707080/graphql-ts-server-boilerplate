import { ResolverMap } from "../../types/graphql-utils";
import { createMiddleware } from "../../utils/createMiddleware";
import { User } from "../../models/user";
import middleware from "./middleware";

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session }) =>
      User.findOne({ _id: session.userId })
    )
  }
};
