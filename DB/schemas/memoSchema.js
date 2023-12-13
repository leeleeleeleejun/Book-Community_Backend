import { Schema } from "mongoose";
import { myBookItemSchema } from "./userSchema.js";
const MemoSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    author: { type: Schema.Types.ObjectId, ref: "users" },
    book_info: {
      type: myBookItemSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default MemoSchema;
