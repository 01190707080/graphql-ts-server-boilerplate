import { mongoose } from "../config/database";
import * as bcrypt from "bcryptjs";

export interface IUserModel extends mongoose.Document {
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre<IUserModel>("save", function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

export default mongoose.model<IUserModel>("User", UserSchema);
