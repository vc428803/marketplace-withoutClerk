import { apiUrl } from "../config/api";
import axios from "axios";
export const getProducts = async () => {
  const response = await fetch(apiUrl("/products"), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`產品載入失敗：${response.status}`);
  }

  return response.json();
};

// get data from product by passing specific key ex: http://localhost:3000/products/search?keyword=商品2

export const searchProducts = async (keyword) => {
  const { data } = await axios.get(
    apiUrl(`/products/search?keyword=${encodeURIComponent(keyword)}`),
  );
  return data;
};
