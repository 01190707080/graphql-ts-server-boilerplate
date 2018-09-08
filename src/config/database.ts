import * as mongoose from "mongoose";

(mongoose as any).Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/graphql-ts-server-boilerplate");

export { mongoose };
