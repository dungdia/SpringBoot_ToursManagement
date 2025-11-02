import { useDebounce } from "@/hooks/useDebounce";
import {
   changePassByUserInfoEmail,
   checkUserInfoCurrentPassword,
} from "@/services/userService";
import { handleEmailChange, handleNewPasswordChange } from "@/utils/vaidate";
import { Button, Form, Input, message } from "antd";
import React, { useEffect, useRef, useState } from "react";

export default function ChangePassword() {
   const [formChangePass] = Form.useForm();
   const emailRef = useRef(null);
   const [loading, setLoading] = useState(false);
   const [emailStatus, setEmailStatus] = useState("");
   const [passwordStatus, setPasswordStatus] = useState("");
   const [newPasswordStatus, setNewPasswordStatus] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");

   const accountLogged =
      JSON.parse(localStorage.getItem("accountLogged")) || {};

   // Chạy 1 lần khi component được mount
   useEffect(() => {
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      formChangePass.resetFields();
      setTimeout(() => {
         if (emailRef.current) {
            emailRef.current.focus();
         }
      }, 100);
   }, []);

   // Hàm reset form đổi mật khẩu
   const handleResetFormChangePass = () => {
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      formChangePass.resetFields();
      message.info("Đã xóa dữ liệu!");
      setTimeout(() => {
         if (emailRef.current) {
            emailRef.current.focus();
         }
      }, 100);
   };

   // Hàm đổi mật khẩu
   const handleChangePass = async () => {
      try {
         const values = await formChangePass.validateFields();
         setLoading(true);

         const { email, password, newPassword } = values;

         if (email !== accountLogged.email) {
            message.error("Tài khoản email không chính xác");
            setLoading(false);
            return;
         }

         if (newPassword === password) {
            message.error("Mật khẩu mới trung mới mật khẩu cũ");
            setLoading(false);
            return;
         }

         const isCurrentPasswordCorrect = await checkUserInfoCurrentPassword(
            password,
            email
         );

         if (!isCurrentPasswordCorrect) {
            message.error("Mật khẩu hiện tại không đúng!");
            setLoading(false); // Dừng loading nếu mật khẩu sai
            return;
         }

         // Gọi API
         const response = await changePassByUserInfoEmail(
            accountLogged.email,
            newPassword
         );

         if (response) {
            message.success("Đổi mật khẩu thành công!");
            handleResetFormChangePass(); // Đóng modal sau khi đổi mật khẩu thành công
            setEmailStatus("");
            setPasswordStatus("");
            setNewPasswordStatus("");
            formChangePass.resetFields();
         } else {
            message.error("Đổi mật khẩu thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
         setLoading(false);
      }
   };

   // Sử dụng useDebounce để debounce giá trị password
   const debouncedPassword = useDebounce(currentPassword, 800);

   // Hàm xử lý onChanePassword
   const handlePasswordChange = async (e) => {
      const password = e.target.value;
      setCurrentPassword(password);
   };

   // Hàm kiểm tra xem nhập password giống với password của email muốn đổi mk chưa
   useEffect(() => {
      const checkPassword = async () => {
         if (debouncedPassword) {
            const email = formChangePass.getFieldValue("email");
            if (!debouncedPassword || email !== accountLogged.email) {
               message.error("Mật khẩu hoặc email đã sai");
               setPasswordStatus("error");
               return;
            }
            try {
               // Gọi API kiểm tra mật khẩu
               const isPasswordCorrect = await checkUserInfoCurrentPassword(
                  debouncedPassword,
                  email
               );
               if (isPasswordCorrect) {
                  setPasswordStatus("success");
               } else {
                  setPasswordStatus("error");
               }
            } catch (error) {
               setPasswordStatus("error");
            }
         }
      };

      checkPassword();
   }, [debouncedPassword]);

   return (
      <>
         <div className="flex items-center justify-start">
            <Form
               className="w-[350px]"
               form={formChangePass}
               requiredMark={false}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  validateStatus={emailStatus}
                  label={<div className="font-bold">Email</div>}
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: "Email không được bỏ trống",
                     },
                     {
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email không hợp lệ",
                     },
                  ]}
               >
                  <Input
                     autoComplete="email"
                     ref={emailRef}
                     onChange={(e) => handleEmailChange(e, setEmailStatus)}
                  />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus={passwordStatus}
                  label={<div className="font-bold">Mật khẩu hiện tại</div>}
                  name="password"
                  rules={[
                     {
                        required: true,
                        message: "Password không được bỏ trống",
                     },
                  ]}
               >
                  <Input.Password
                     value={currentPassword}
                     onChange={handlePasswordChange}
                  />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus={newPasswordStatus}
                  label={<div className="font-bold">Mật khẩu mới</div>}
                  name="newPassword"
                  rules={[
                     {
                        required: true,
                        message: "Password mới không được để trống",
                     },
                     {
                        pattern: /^[A-Za-z0-9]{6,}$/,
                        message:
                           "Password phải từ 6 ký tự trở lên và không có ký tự đặc biệt hoặc khoảng trắng",
                     },
                  ]}
               >
                  <Input.Password
                     onChange={(e) =>
                        handleNewPasswordChange(
                           e.target.value,
                           setNewPasswordStatus
                        )
                     }
                  />
               </Form.Item>
               <Form.Item>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleResetFormChangePass}
                        type="primary"
                        danger
                        ghost
                        htmlType="button"
                     >
                        Tải lại
                     </Button>
                     <Button
                        loading={loading}
                        type="primary"
                        htmlType="button"
                        onClick={handleChangePass}
                     >
                        Cập nhật mật khẩu
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </div>
      </>
   );
}
