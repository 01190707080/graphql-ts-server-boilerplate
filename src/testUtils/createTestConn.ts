import * as mongoose from "mongoose";

(mongoose as any).Promise = global.Promise;

export const createTestConn = async (resetDB: boolean = false) => {
  await mongoose.connect(
    "mongodb://localhost:27017/graphql-ts-server-boilerplate-test"
  );
  if (resetDB) {
    await mongoose.connection.db.dropDatabase();
  }
};
