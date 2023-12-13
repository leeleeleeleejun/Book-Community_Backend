import { model } from "mongoose";
import MemoSchema from "../schemas/memoSchema.js";

const MemoModel = model("memos", MemoSchema);

export default MemoModel;
