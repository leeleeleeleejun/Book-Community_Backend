import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import memoRoutes from "./routes/memoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/userimg", express.static("uploads"));

mongoose.connect(process.env.DB_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// DB
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB 연결 오류:", error);
});
db.once("open", () => {
  console.log("MongoDB 연결 성공");
});

// 라우터 등록
app.use(userRoutes);
app.use(memoRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("hello");
});
