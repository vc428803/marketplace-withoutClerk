import { apiUrl } from "../config/api";
// 自訂 hook 整合 useSearch + useQuery，專門處理文章 API
import { useSearch } from "@tanstack/react-router";
import axios from "axios";

async function fetchArticles(params) {
  // URLSearchParams 把一個物件轉換成 URL 查詢字串

  //   假設 params = { page: 1, pageSize: 5, tag: "deep-dive" }
  //   那麼 queryString 會是： page=1&pageSize=5&tag=deep-dive
  const queryString = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.tag && { tag: params.tag }),
  }).toString();

  // axios.get 直接傳 query string，自動附加到 base URL
  // 理由：比 fetch 簡潔，response.data 就是 JSON，無需 .json()
  const { data } = await axios.get(
    apiUrl(`/articles?${queryString}`),
  );
  return data;
}
