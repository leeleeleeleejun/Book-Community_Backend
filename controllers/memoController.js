import MemoModel from "../DB/models/memoModel.js";

export const getMemo = async (req, res) => {
  try {
    const { param } = req.query;
    const memo = await MemoModel.findOne({ _id: param }).populate("author");

    res.status(200).json({ memo, message: "글을 가져왔습니다." });
  } catch (error) {
    console.error("데이터를 가져오는 중 에러 발생:", error);
    res
      .status(500)
      .json({ error: "데이터를 가져오는 중 에러가 발생했습니다." });
  }
};

export const postMemo = async (req, res) => {
  try {
    const newMemo = await MemoModel.create(req.body);
    res.status(200).json({ message: "글이 작성되었습니다." });
  } catch (error) {
    console.error("데이터를 생성 중 에러 발생:", error);
    res.status(500).json({ error: "작성에 실패했습니다." });
  }
};

export const editMemo = async (req, res) => {
  try {
    const { _id } = req.body;
    req.body.book_info = req.body.book_info || { cover: "", title: "" };

    await MemoModel.findByIdAndUpdate(_id, req.body);
    res.status(200).json({ message: "글이 수정되었습니다." });
  } catch (error) {
    console.error("메모 수정 에러:", error);
    res.status(500).json({ error: "수정에 실패했습니다." });
  }
};

export const deleteMemo = async (req, res) => {
  try {
    const { _id } = req.body;
    await MemoModel.findByIdAndDelete(_id);
    res.status(200).json({ message: "글이 삭제되었습니다." });
  } catch (error) {
    console.error("메모 수정 에러:", error);
    res.status(500).json({ error: "삭제에 실패했습니다." });
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
    res
      .status(500)
      .json({ error: "데이터를 가져오는 중 에러가 발생했습니다." });
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
    res
      .status(500)
      .json({ error: "데이터를 가져오는 중 에러가 발생했습니다." });
  }
};
