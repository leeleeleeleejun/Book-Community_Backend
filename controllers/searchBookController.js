import axios from "axios";

export const searchBook = async (req, res) => {
  try {
    const { param } = req.query;
    const url = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${process.env.ALADIN_API}&Query=${param}&QueryType=Title&Cover=MidBig&output=JS`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.log(error);
  }
};
