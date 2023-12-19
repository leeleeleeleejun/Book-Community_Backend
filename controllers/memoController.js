import MemoModel from "../DB/models/memoModel.js";

const SUCCESS_MESSAGES = {
  DATA_FETCH_SUCCESS: "글을 가져왔습니다.",
  CREATION_SUCCESS: "글이 작성되었습니다.",
  UPDATE_SUCCESS: "글이 수정되었습니다.",
  DELETE_SUCCESS: "글이 삭제되었습니다.",
};

const ERROR_MESSAGES = {
  DATA_FETCH_ERROR: "데이터를 가져오는 중 에러가 발생했습니다.",
  CREATION_FAILURE: "작성에 실패했습니다.",
  UPDATE_FAILURE: "수정에 실패했습니다.",
  DELETE_FAILURE: "삭제에 실패했습니다.",
};

export const getMemo = async (req, res) => {
  try {
    const { param } = req.query;
    const memo = await MemoModel.findOne({ _id: param }).populate("author");

    res
      .status(200)
      .json({ memo, message: SUCCESS_MESSAGES.DATA_FETCH_SUCCESS });
  } catch (error) {
    console.error("데이터를 가져오는 중 에러 발생:", error);
    res.status(500).json({ error: ERROR_MESSAGES.DATA_FETCH_ERROR });
  }
};

export const postMemo = async (req, res) => {
  try {
    const newMemo = await MemoModel.create(req.body);
    res.status(200).json({ message: SUCCESS_MESSAGES.CREATION_SUCCESS });
  } catch (error) {
    console.error("데이터를 생성 중 에러 발생:", error);
    res.status(500).json({ error: ERROR_MESSAGES.CREATION_FAILURE });
  }
};

export const editMemo = async (req, res) => {
  try {
    const { _id } = req.body;
    req.body.book_info = req.body.book_info || { cover: "", title: "" };

    await MemoModel.findByIdAndUpdate(_id, req.body);
    res.status(200).json({ message: SUCCESS_MESSAGES.UPDATE_SUCCESS });
  } catch (error) {
    console.error("메모 수정 에러:", error);
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_FAILURE });
  }
};

export const deleteMemo = async (req, res) => {
  try {
    const { _id } = req.body;
    await MemoModel.findByIdAndDelete(_id);
    res.status(200).json({ message: SUCCESS_MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    console.error("메모 수정 에러:", error);
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_FAILURE });
  }
};

export const getAllMemo = async (req, res) => {
  try {
    const { param } = req.query;
    const page = param * 5;
    const memos = await MemoModel.find({}).populate("author");
    const SliceMemo = memos.reverse().slice(page, page + 5);

    res.status(200).json({ memos: SliceMemo, message: "글이 작성되었습니다." });
  } catch (error) {
    console.error("데이터를 가져오는 중 에러 발생:", error);
    res.status(500).json({ error: ERROR_MESSAGES.DATA_FETCH_ERROR });
  }
};

export const getUserMemo = async (req, res) => {
  try {
    const { param, userId } = req.query;
    const page = param * 5;
    const memos = await MemoModel.find({ author: userId }).populate("author");
    const SliceMemo = memos.reverse().slice(page, page + 5);

    res.status(200).json({ memos: SliceMemo, message: "글을 가져왔습니다." });
  } catch (error) {
    console.error("데이터를 가져오는 중 에러 발생:", error);
    res.status(500).json({ error: ERROR_MESSAGES.DATA_FETCH_ERROR });
  }
};
