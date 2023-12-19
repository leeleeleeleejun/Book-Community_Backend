import UserModel from "../DB/models/userModel.js";
import jwt from "jsonwebtoken";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "내부 서버 오류.",
  USER_NOT_FOUND: "유저를 찾을 수 없습니다.",
  FILE_NOT_UPLOADED: "파일이 업로드되지 않았습니다.",
  BOOKSHELF_FULL: "해당 책장이 가득 찼습니다.",
  BOOK_ALREADY_EXISTS: "이미 포함되어 있는 책입니다.",
};

const SUCCESS_MESSAGES = {
  PROFILE_UPLOAD_SUCCESS: "프로필이 성공적으로 업로드되었습니다.",
  PROFILE_IMAGE_UPLOAD_SUCCESS: "프로필 이미지가 성공적으로 업로드되었습니다.",
  PROFILE_IMAGE_DELETE_SUCCESS: "프로필 이미지가 성공적으로 삭제되었습니다.",
  USER_DELETED: "탈퇴되었습니다.",
  RECORD_SAVED: "기록 되었습니다.",
  UPLOAD_SUCCESS: "성공적으로 업로드되었습니다.",
  DELETE_SUCCESS: "성공적으로 삭제되었습니다.",
};

const projectId = process.env.GCLOUD_PROJECT_ID;

const credentials = {
  type: "service_account",
  project_id: "banded-meridian-408510",
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email: "wnstjr6293@banded-meridian-408510.iam.gserviceaccount.com",
  client_id: "118139727720179926467",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/wnstjr6293%40banded-meridian-408510.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const storage = new Storage({
  projectId,
  credentials,
});

const bucket = storage.bucket("bucket-get-started_book-community-405803");

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

    res.status(200).json({ message: SUCCESS_MESSAGES.PROFILE_UPLOAD_SUCCESS });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const editUserImgAPI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: ERROR_MESSAGES.FILE_NOT_UPLOADED });
    }

    const { user, file } = req;
    const fileName = `profile_${user.userId}.jpg`;

    if (!user.profile) {
      const existingUser = await UserModel.findById(user.userId);

      existingUser.profile = fileName;

      await existingUser.save();
    } else {
      await bucket.file(fileName).delete();
    }

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream();

    blobStream.on("finish", () => {
      res
        .status(200)
        .json({ message: SUCCESS_MESSAGES.PROFILE_IMAGE_UPLOAD_SUCCESS });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("프로필 이미지 처리 중 오류:", error);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const deleteUserImgAPI = async (req, res) => {
  try {
    const { user } = req;
    const existingUser = await UserModel.findById(user.userId);
    existingUser.profile = "";
    await existingUser.save();

    const fileName = `profile_${user.userId}.jpg`;

    // 프로필 사진 파일 삭제
    await bucket.file(fileName).delete();

    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.PROFILE_IMAGE_DELETE_SUCCESS });
  } catch (error) {
    console.error("프로필 이미지 처리 중 오류:", error);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { _id } = req.body;
    await UserModel.findByIdAndDelete(_id);
    res.status(200).json({ message: ERROR_MESSAGES.USER_DELETED });
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
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    const activity_graph_lastWeek =
      existingUser.activity_graph[existingUser.activity_graph.length - 1];
    activity_graph_lastWeek.activities[day] += active;

    existingUser.activity_graph[existingUser.activity_graph.length - 1] =
      activity_graph_lastWeek;

    await existingUser.save();

    res.json({ message: ERROR_MESSAGES.RECORD_SAVED });
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
      res.status(401).json({ error: ERROR_MESSAGES.BOOKSHELF_FULL });
    }

    if (checkBook.length > 0) {
      res.status(401).json({ error: ERROR_MESSAGES.BOOK_ALREADY_EXISTS });
    } else {
      bookList.push(body.book_info);
      await existingUser.save();
      res.status(200).json({ message: SUCCESS_MESSAGES.UPLOAD_SUCCESS });
    }
  } catch (error) {
    console.error(" 처리 중 오류:", error);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
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
    res.status(200).json({ message: SUCCESS_MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    console.error(" 처리 중 오류:", error);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
