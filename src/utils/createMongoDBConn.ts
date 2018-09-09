import * as mongoose from "mongoose";

(mongoose as any).Promise = global.Promise;

export default async () => {
  if (process.env.NODE_ENV === "test") {
    await mongoose.connect(
      "mongodb://localhost:27017/graphql-ts-server-boilerplate-test"
    );
    await mongoose.connection.db.dropDatabase();
  } else {
    await mongoose.connect(
      "mongodb://localhost:27017/graphql-ts-server-boilerplate"
    );
  }
};
