import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as passport from "passport";
import { Strategy } from "passport-twitter";

import { redis } from "./redis";
import createMongoDBConn from "./utils/createMongoDBConn";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";
import { redisSessionPrefix } from "./constants";
import { User, IUserModel } from "./models/user";
import { createTestConn } from "./testUtils/createTestConn";

const SESSION_SECRET = "ajslkjalksjdfkl";
const RedisStore = connectRedis(session);

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    await redis.flushall();
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request
    })
  });

  server.express.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0 // disable delaying - full speed until the max limit is reached
    })
  );

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string)
  };

  server.express.get("/confirm/:id", confirmEmail);

  if (process.env.NODE_ENV === "test") {
    await createTestConn(true);
  } else {
    await createMongoDBConn();

    passport.use(
      new Strategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
          callbackURL: "http://localhost:4000/auth/twitter/callback",
          includeEmail: true
        },
        async (_, __, profile, cb) => {
          const { id, emails } = profile;
  
          let email: string | null = null;
  
          if (emails) {
            email = emails[0].value;
          }
  
          const user = User.findOne({
            $or: [{ twitterId: id }, { email }]
          });
  
          if (!user) {
            // this user needs to be registered
            (user as IUserModel) = await User.create({
              twitterId: id,
              email
            });
          } else if (!(user as any).twitterId) {
            // merge account
            // we found user by email
            User.update(
              {
                _id: (user as any)._id
              },
              {
                twitterId: id
              }
            );
          } else {
            // we have a twitterId
            // login
          }
  
          return cb(null, { _id: (user as any)._id });
        }
      )
    );
  
    server.express.use(passport.initialize());
  
    server.express.get("/auth/twitter", passport.authenticate("twitter"));
  
    server.express.get(
      "/auth/twitter/callback",
      passport.authenticate("twitter", { session: false }),
      (req, res) => {
        (req.session as any).userId = (req.user as any)._id;
        // @todo redirect to frontend
        res.redirect("/");
      }
    );
  }

  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");
  return app;
};
