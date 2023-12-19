import { Router } from "express";
import * as UserController from "../controllers/usersController.js";
import * as SearchBookController from "../controllers/searchBookController.js";
import {
  checkDuplicate,
  authenticateToken,
  checkNewWeek,
} from "../middleware/userMiddleware.js";
import multer from "multer";

const router = Router();

const multerUpload = multer({
  storage: multer.memoryStorage(),
});

// 사용자 생성 라우트
router.post("/signup", checkDuplicate, UserController.signUpAPI);
router.post("/login", UserController.loginAPI);

// 유저 정보
router.get("/AnotherUser", UserController.getAnotherUserInfoAPI);
router.get(
  "/user",
  authenticateToken,
  checkNewWeek,
  UserController.getUserInfoAPI
);
router.put("/user", authenticateToken, UserController.editUserInfoAPI);

router.put(
  "/userimg",
  authenticateToken,
  multerUpload.single("profile"),
  UserController.editUserImgAPI
);
router.delete("/userimg", authenticateToken, UserController.deleteUserImgAPI);
router.delete("/user", authenticateToken, UserController.deleteUser);

router.put("/readtime", authenticateToken, UserController.pushReadTimeAPI);
router.post(
  "/library",
  authenticateToken,
  UserController.postLibraryBookItemAPI
);
router.delete(
  "/library",
  authenticateToken,
  UserController.deleteLibraryBookItemAPI
);

//책 검색 라우트
router.get("/searchbook", authenticateToken, SearchBookController.searchBook);
export default router;
