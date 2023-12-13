import { model } from "mongoose";
import bcrypt from "bcrypt";
import UserSchema from "../schemas/userSchema.js";

// 비밀번호를 해싱하기 전에 실행되는 훅
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const UserModel = model("users", UserSchema);

export default UserModel;
