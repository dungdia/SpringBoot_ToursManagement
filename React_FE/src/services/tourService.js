import baseURL from "@/api/instance";
import { message } from "antd";

const getAllToursNotFilter = async () => {
   const response = await baseURL.get("/admin/tours/findAllNoFilter");
   return response;
};

const getAllTours = async (
   search,
   currentPage = 0,
   pageSize = 8,
   areaId = null
) => {
   let url = `/admin/tours/findAll?search=${search}&page=${currentPage}&size=${pageSize}`;
   // Thêm tham số areaId nếu không phải là null
   if (areaId !== null) {
      url += `&areaId=${areaId}`;
   }

   const response = await baseURL.get(url);
   return response.data;
};

const createTour = async (values) => {
   const response = await baseURL.post("/admin/tours", values);
   return response;
};

const getAllImagesUrlsByTourId = async (tourId) => {
   const response = await baseURL.get(
      `/admin/tours/findAllImagesURLs/${tourId}`
   );
   return response;
};

const createImagesForTour = async (tourId, values) => {
   const response = await baseURL.post(`/admin/tours/${tourId}/images`, values);
   return response;
};

const updateImagesForTour = async (tourId, imageId, values) => {
   const response = await baseURL.put(
      `/admin/tours/${tourId}/images/${imageId}`,
      values
   );
   return response;
};

const removeImageByTourIdAndImageId = async (tourId, imageId) => {
   const response = await baseURL.delete(
      `/admin/tours/${tourId}/images/${imageId}`
   );
   return response;
};

export {
   getAllTours,
   createTour,
   getAllToursNotFilter,
   getAllImagesUrlsByTourId,
   createImagesForTour,
   updateImagesForTour,
   removeImageByTourIdAndImageId,
};
