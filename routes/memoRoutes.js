import { Router } from "express";
import * as MemoController from "../controllers/memoController.js";
import { authenticateToken } from "../middleware/userMiddleware.js";
const router = Router();

router.get("/memo", MemoController.getMemo);
router.post("/memo", authenticateToken, MemoController.postMemo);
router.put("/memo", authenticateToken, MemoController.editMemo);
router.delete("/memo", authenticateToken, MemoController.deleteMemo);

router.get("/memos", MemoController.getAllMemo);

router.get("/memo/user", MemoController.getUserMemo);
export default router;
