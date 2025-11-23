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

// =====================================================================================================================
// SERVICE XEM HÌNH ẢNH
// =====================================================================================================================

const getAllImagesUrlsByTourIdNotePage = async (tourId) => {
   const response = await baseURL.get(
      `/admin/tours/findAllImagesURLsNotPage/${tourId}`
   );
   return response;
};

const getAllImagesUrlsByTourIdWithPage = async (
   tourId,
   currentPage,
   pageSize
) => {
   const response = await baseURL.get(
      `/admin/tours/findAllImagesURLsWithPage/${tourId}?page=${currentPage}&size=${pageSize}`
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

// =====================================================================================================================
// SERVICE XEM LỊCH TRÌNH
// =====================================================================================================================

const getAllDayDetailsByTourIdNotPage = async (tourId) => {
   const response = await baseURL.get(
      `/admin/tours/findAllDayDetailsNotPage/${tourId}`
   );
   return response;
};

const getAllDayDetailsByTourIdWithFilterPage = async (
   tourId,
   search = "",
   status = null,
   departureDateFrom = null,
   departureDateTo = null,
   returnDateFrom = null,
   returnDateTo = null,
   currentPage = 0,
   pageSize = 5
) => {
   let url = `/admin/tours/findAllDayDetailsWithFilterPage/${tourId}?search=${search}&page=${currentPage}&size=${pageSize}`;

   // Thêm tham số status nếu không phải là null
   if (status !== null) {
      url += `&status=${status}`;
   }

   // Thêm tham số departureDateFrom nếu không phải là null
   if (departureDateFrom !== null) {
      url += `&departureDateFrom=${departureDateFrom}`;
   }
   // Thêm tham số departureDateTo nếu không phải là null
   if (departureDateTo !== null) {
      url += `&departureDateTo=${departureDateTo}`;
   }
   // Thêm tham số returnDateFrom nếu không phải là null
   if (returnDateFrom !== null) {
      url += `&returnDateFrom=${returnDateFrom}`;
   }
   // Thêm tham số returnDateTo nếu không phải là null
   if (returnDateTo !== null) {
      url += `&returnDateTo=${returnDateTo}`;
   }

   const response = await baseURL.get(url);
   return response;
};

const createDayDetailForTour = async (tourId, values) => {
   const response = await baseURL.post(
      `/admin/tours/${tourId}/dayDetails`,
      values
   );
   return response;
};

const removeDayDetailByTourIdAndDayDetailId = async (tourId, dayDetailId) => {
   const response = await baseURL.delete(
      `/admin/tours/${tourId}/dayDetails/${dayDetailId}`
   );
   return response;
};

const unblockStatusDayDetail = async (tourId, dayDetailId) => {
   const response = await baseURL.post(
      `/admin/tours/${tourId}/dayDetails/${dayDetailId}/openBlock`
   );
   return response;
};

const updateDayDetailByTourIdAndDayDetailId = async (tourId, dayDetailId, values) => {
   const response = await baseURL.put(
      `/admin/tours/${tourId}/dayDetails/${dayDetailId}`,
      values
   );
   return response;
}

export {
   getAllTours,
   createTour,
   getAllToursNotFilter,
   getAllImagesUrlsByTourIdNotePage,
   getAllImagesUrlsByTourIdWithPage,
   createImagesForTour,
   updateImagesForTour,
   removeImageByTourIdAndImageId,
   getAllDayDetailsByTourIdNotPage,
   getAllDayDetailsByTourIdWithFilterPage,
   createDayDetailForTour,
   removeDayDetailByTourIdAndDayDetailId,
   unblockStatusDayDetail,
   updateDayDetailByTourIdAndDayDetailId,
};
