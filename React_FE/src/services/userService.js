import baseURL from "@/api/instance";
import { message } from "antd";

// ========= User Service ==========
const updateUserInfo = async (id, values) => {
   const response = await baseURL.put(`/user/${id}`, values);
   return response;
};

const findUserInfoEmailById = async (id) => {
   const response = await baseURL.get(`/user/email/${id}`);
   return response;
};

const findUserInfoByEmail = async (email) => {
   const response = await baseURL.get(`/user/by-email/${email}`);
   return response.data;
};

const changePassByUserInfoEmail = async (email, newPassword) => {
   const response = await baseURL.put(`/user/change-password/${email}`, null, {
      params: {
         newPassword: newPassword,
      },
   });
   return response.data;
};

const checkUserInfoCurrentPassword = async (currentPassword, email) => {
   try {
      // Lấy accessToken từ cookie
      const response = await baseURL.put(
         `/user/check-password`, // API endpoint
         null, // Không có body, chỉ sử dụng params
         {
            params: {
               email: email, // Truyền email vào URL params
               inputPassword: currentPassword, // Truyền mật khẩu vào URL params
            },
         }
      );

      if (response.status === 200 && response.data === "Mật khẩu chính xác") {
         message.success("Mật khẩu đúng");

         return true;
      } else {
         message.error(response.data); // In ra thông báo nếu mật khẩu không đúng
         return false;
      }
   } catch (error) {
      // Xử lý lỗi khi gọi API
      message.error("Có lỗi xảy ra khi kiểm tra mật khẩu hiện tại");
      return false;
   }
};

export {
   updateUserInfo,
   findUserInfoEmailById,
   findUserInfoByEmail,
   changePassByUserInfoEmail,
   checkUserInfoCurrentPassword,
};
