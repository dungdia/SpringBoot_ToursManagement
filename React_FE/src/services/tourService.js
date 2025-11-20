import baseURL from "@/api/instance";
import { message } from "antd";

const getAllToursNotFilter = async () => {
   const response = await baseURL.get("/admin/tours/findAll");
   return response;
};
const createTour = async (values) => {
   const response = await baseURL.post("/admin/tours", values);
   return response;
};

export { createTour, getAllToursNotFilter };
