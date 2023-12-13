import { Schema } from "mongoose";

export const myBookItemSchema = new Schema({
  cover: { type: String, required: true },
  title: { type: String, required: true },
});

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  introduction: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  profile: {
    type: String,
  },
  activity_graph: {
    type: [
      {
        date: { type: Date },
        activities: { type: [Number] },
      },
    ],
  },
  my_book: {
    bestBook: [myBookItemSchema],
    readBook: [myBookItemSchema],
    hopeBook: [myBookItemSchema],
  },
});

export default UserSchema;
