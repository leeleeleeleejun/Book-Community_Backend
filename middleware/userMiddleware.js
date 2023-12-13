import UserModel from "../DB/models/userModel.js";
import jwt from "jsonwebtoken";

// 중복 체크 미들웨어
export const checkDuplicate = async (req, res, next) => {
  const { email, nickname, phone_number } = req.body;
  try {
    const existingEmail = await UserModel.findOne({ email });
    const existingNickname = await UserModel.findOne({ nickname });
    const existingPhoneNumber = await UserModel.findOne({ phone_number });

    if (existingEmail) {
      return res.status(400).json({ error: "이미 사용 중인 이메일입니다." });
    }
    if (existingNickname) {
      return res.status(400).json({ error: "이미 사용 중인 닉네임입니다." });
    }
    if (existingPhoneNumber) {
      return res.status(400).json({ error: "이미 사용 중인 전화번호입니다." });
    }

    next();
  } catch (error) {
    console.error("중복 체크 에러:", error);
    return res
      .status(500)
      .json({ error: "서버 오류로 인해 회원가입에 실패했습니다." });
  }
};

// JWT 검증 및 유저 정보 추출
export const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // 헤더에서 토큰 추출

  if (!token) {
    return res.status(401).json({ error: "인증되지 않은 사용자입니다." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "토큰이 유효하지 않습니다." });
    }
    req.user = user; // 요청 객체에 유저 정보 추가
    next();
  });
};

export const checkNewWeek = async (req, res, next) => {
  const user = req.user;
  const existingUser = await UserModel.findById(user.userId);

  // 배열 마지막주
  const lastWeek =
    existingUser.activity_graph[existingUser.activity_graph.length - 1].date;

  // 오늘이 포함된 주의 시작날짜
  const today = new Date();
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - today.getDay());

  if (lastWeek.getDate() !== startOfCurrentWeek.getDate()) {
    // 현재 주의 시작 날짜와 마지막 주의 날짜의 차이 계산
    const dayDifference = startOfCurrentWeek.getDate() - lastWeek.getDate();
    const weekDifference = Math.floor(dayDifference / 7);
    for (let i = 1; i <= weekDifference; i++) {
      const newWeekStartDate = new Date(lastWeek);
      newWeekStartDate.setDate(lastWeek.getDate() + i * 7);

      const newWeek = {
        date: newWeekStartDate,
        activities: [0, 0, 0, 0, 0, 0, 0],
      };

      existingUser.activity_graph.shift();
      existingUser.activity_graph.push(newWeek);
    }

    await existingUser.save();
  }

  next();
};
