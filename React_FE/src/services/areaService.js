import baseURL from "@/api/instance";
import { message } from "antd";

// const getAllAreas = async () => {
//    const response = await baseURL.get("/admin/areas/findAll");
//    return response;
// };

const getAllAreas = async (
   search,
   currentPage = 0,
   pageSize = 8,
   statusArea = null
) => {
   let url = `/admin/areas/findAll?search=${search}&page=${currentPage}&size=${pageSize}`;
   // Thêm tham số statusArea nếu không phải là null
   if (statusArea !== null) {
      url += `&statusArea=${statusArea}`;
   }

   const response = await baseURL.get(url);
   return response.data;
};

const createArea = async (values) => {
   const response = await baseURL.post("/admin/areas", values);
   return response;
};

const updateArea = async (id, values) => {
   const response = await baseURL.put(`/admin/areas/${id}`, values);
   return response;
};

const removeArea = async (id) => {
   const response = await baseURL.delete(`/admin/areas/${id}`);
   return response;
};

const unblockStatus = async (id) => {
   const response = await baseURL.post(`/admin/areas/unblockStatus/${id}`);
   return response;
};

export { getAllAreas, createArea, updateArea, removeArea, unblockStatus };
