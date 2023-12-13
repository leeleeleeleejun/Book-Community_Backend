import UserModel from "../DB/models/userModel.js";
import jwt from "jsonwebtoken";
import fs from "fs";

// 회원가입 컨트롤러
export const signUpAPI = async (req, res) => {
  try {
    const newUser = await UserModel.create(req.body);
    res.status(200).json({ message: "회원가입에 성공했습니다." });
  } catch (error) {
    console.error("회원가입 에러:", error);
    res.status(500).json({ error: "회원가입에 실패했습니다." });
  }
};

// 로그인 컨트롤러
export const loginAPI = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 이메일로 사용자 찾기
    const user = await UserModel.findOne({ email });
    // 사용자가 존재하지 않는 경우
    if (!user) {
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 잘못되었습니다." });
    }

    // 비밀번호 일치 여부 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 잘못되었습니다." });
    }

    // 로그인 성공 시 JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    // JWT 토큰을 클라이언트에게 전송
    res.json({
      message: "로그인 성공!",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "서버 오류로 인해 로그인에 실패했습니다." });
  }
};

// 로그인한 사용자 정보 엔드포인트
export const getUserInfoAPI = async (req, res) => {
  const user = req.user;
  try {
    const userData = await UserModel.findById(user.userId);

    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: "서버 오류로 데이터 조회에 실패했습니다." });
  }
};

// 다른 사용자 정보 엔드포인트
export const getAnotherUserInfoAPI = async (req, res) => {
  const { param } = req.query;
  try {
    const userData = await UserModel.findById(param);

    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: "서버 오류로 데이터 조회에 실패했습니다." });
  }
};

export const editUserInfoAPI = async (req, res) => {
  try {
    const { user, body } = req;
    let existingUser = await UserModel.findById(user.userId);
    existingUser.nickname = body.nickname || existingUser.nickname;
    existingUser.introduction = body.introduction || existingUser.introduction;
    existingUser.password = body.password || existingUser.password;
    existingUser.phone_number = body.phone_number || existingUser.phone_number;

    await existingUser.save();

    res.status(200).json({ message: "프로필이 성공적으로 업로드되었습니다." });
  } catch (error) {
    res.status(500).json({ error: "내부 서버 오류." });
  }
};

export const editUserImgAPI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
    }
    const { user, file } = req;
    const existingUser = await UserModel.findById(user.userId);

    existingUser.profile = file.filename;

    await existingUser.save();

    res
      .status(200)
      .json({ message: "프로필 이미지가 성공적으로 업로드되었습니다." });
  } catch (error) {
    console.error("프로필 이미지 처리 중 오류:", error);
    res.status(500).json({ error: "내부 서버 오류." });
  }
};

export const deleteUserImgAPI = async (req, res) => {
  try {
    const { user } = req;
    const existingUser = await UserModel.findById(user.userId);
    existingUser.profile = "";
    await existingUser.save();

    const imgPath = "uploads/profile_" + user.userId + ".jpg";

    if (fs.existsSync(imgPath)) {
      // 파일이 존재한다면 true 그렇지 않은 경우 false 반환
      fs.unlinkSync(imgPath);
    }
    res
      .status(200)
      .json({ message: "프로필 이미지가 성공적으로 업로드되었습니다." });
  } catch (error) {
    console.error("프로필 이미지 처리 중 오류:", error);
    res.status(500).json({ error: "내부 서버 오류." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { _id } = req.body;
    await UserModel.findByIdAndDelete(_id);
    res.status(200).json({ message: "탈퇴되었습니다." });
  } catch (error) {
    console.error("메모 수정 에러:", error);
    res.status(500).json({ error: "탈퇴에 실패했습니다." });
  }
};

export const pushReadTimeAPI = async (req, res) => {
  try {
    const user = req.user;
    const { day, active } = req.body;
    const existingUser = await UserModel.findById(user.userId);

    if (!existingUser) {
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    }

    const activity_graph_lastWeek =
      existingUser.activity_graph[existingUser.activity_graph.length - 1];
    activity_graph_lastWeek.activities[day] += active;

    existingUser.activity_graph[existingUser.activity_graph.length - 1] =
      activity_graph_lastWeek;

    await existingUser.save();

    res.json({ message: "기록 되었습니다." });
  } catch (error) {
    res.status(500).json({ error: "서버 오류로 데이터 저장에 실패했습니다." });
  }
};

export const postLibraryBookItemAPI = async (req, res) => {
  try {
    const { user, body } = req;
    const existingUser = await UserModel.findById(user.userId);
    const bookList = existingUser.my_book[body.theme];
    const checkBook = bookList.filter(
      (item) => item.title === body.book_info.title
    );
    if (bookList.length >= 29) {
      res.status(401).json({ error: "해당 책장이 가득 찼습니다." });
    }

    if (checkBook.length > 0) {
      res.status(401).json({ error: "이미 포함되어 있는 책입니다." });
    } else {
      bookList.push(body.book_info);
      await existingUser.save();
      res.status(200).json({ message: "성공적으로 업로드되었습니다." });
    }
  } catch (error) {
    console.error(" 처리 중 오류:", error);
    res.status(500).json({ error: "내부 서버 오류." });
  }
};

export const deleteLibraryBookItemAPI = async (req, res) => {
  try {
    const { user, body } = req;
    const existingUser = await UserModel.findById(user.userId);
    existingUser.my_book[body.theme] = existingUser.my_book[body.theme].filter(
      (item) => item.title !== body.book_info.title
    );

    await existingUser.save();
    res.status(200).json({ message: "성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error(" 처리 중 오류:", error);
    res.status(500).json({ error: "내부 서버 오류." });
  }
};
