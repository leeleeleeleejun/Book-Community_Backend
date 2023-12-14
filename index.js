import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import memoRoutes from "./routes/memoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/userimg", express.static("uploads"));
// 정적 파일 제공 (build 폴더 내부의 파일들을 클라이언트에게 제공)
app.use(express.static(path.join(__dirname, "build")));

// 모든 경로에 대해 index.html 반환
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

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
