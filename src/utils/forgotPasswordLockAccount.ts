import { Redis } from "ioredis";
import { removeAllUsersSessions } from "./removeAllUsersSessions";
import { User } from "../models/user";

export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis
) => {
  // can't login
  await User.update({ _id: userId }, { forgotPasswordLocked: true });
  // remove all sessions
  await removeAllUsersSessions(userId, redis);
};
