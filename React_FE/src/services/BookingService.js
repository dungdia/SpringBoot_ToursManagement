import baseURL from "@/api/instance";
import { message } from "antd";

const getAllBookingsNotFilter = async () => {
   const response = await baseURL.get("/admin/bookings/findAllNotFilter");
   return response;
};

const getAllBookings = async (
   currentPage = 0,
   pageSize = 8,
   status = null,
   userId = null
) => {
   let url = `/admin/bookings/findAllWithFilterPage?page=${currentPage}&size=${pageSize}`;
   // Thêm tham số status nếu không phải là null
   if (status !== null) {
      url += `&status=${status}`;
   }

   // Thêm tham số userId nếu không phải là null
   if (userId !== null) {
      url += `&userId=${userId}`;
   }

   const response = await baseURL.get(url);
   return response.data;
};

const confirmBooking = async (id) => {
   const response = await baseURL.put(`/admin/bookings/${id}/confirm`);
   return response;
};

const cancelBooking = async (id) => {
   const response = await baseURL.put(`/admin/bookings/${id}/cancel`);
   return response;
};

const sendEmailConfirmOrCancelBooking = async (
   email,
   notificationType = "",
   bookingInfo
) => {
   let url = `/admin/users/${email}/booking-notification?`;

   // Thêm tham số notificationType nếu không phải là null
   if (notificationType !== null || notificationType !== "") {
      url += `&notificationType=${notificationType}`;
   }

   const response = await baseURL.post(url, bookingInfo);
   return response.data;
};

// Lấy tất cả dữ liệu khách hàng có phân trang
const getAllCustomers = async (
   currentPage = 0,
   pageSize = 8,
   search = "",
   bookingId
) => {
   let url = `/admin/bookings/findAllCustomerWithFilterPage?search=${search}&page=${currentPage}&size=${pageSize}`;
   // Thêm tham số bookingId nếu không phải là null
   if (bookingId !== null) {
      url += `&bookingId=${bookingId}`;
   }

   const response = await baseURL.get(url);
   return response;
};

const createCustomer = async (values, bookingId) => {
   const response = await baseURL.post(
      `/admin/bookings/${bookingId}/addCustomers`,
      values
   );
   return response;
};

const removeCustomer = async (bookingId, customerId) => {
   const response = await baseURL.delete(
      `/admin/bookings/${bookingId}/deleteCustomer/${customerId}`
   );
   return response;
};

const updateCustomer = async (bookingId, customerId, values) => {
   const response = await baseURL.put(
      `/admin/bookings/${bookingId}/updateCustomer/${customerId}`,
      values
   );
   return response;
};

export {
   getAllBookingsNotFilter,
   getAllBookings,
   confirmBooking,
   cancelBooking,
   sendEmailConfirmOrCancelBooking,
   getAllCustomers,
   createCustomer,
   removeCustomer,
   updateCustomer,
};
