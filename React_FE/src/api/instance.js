import axios from "axios";
import Cookies from "js-cookie";

const baseUrl = axios.create({
   baseURL: "http://localhost:8080/api/v1",
   headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
   },
});

baseUrl.interceptors.request.use(
   (config) => {
      // **ĐỌC TOKEN NGAY TRƯỚC KHI GỬI YÊU CẦU**
      const token = Cookies.get("accessToken");

      const accessToken = `Bearer ${token}`;
      config.headers.Authorization = accessToken;
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

export default baseUrl;
