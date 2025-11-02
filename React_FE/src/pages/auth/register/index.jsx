import { register } from "@/services/authService";
import { Button, Form, Input, message } from "antd";
import { HttpStatusCode } from "axios";
import { LockKeyhole, UserPen, UserRound } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import {
   handleEmailChange,
   handleNameChange,
   handlePasswordChange,
} from "@/utils/vaidate";

export default function Register() {
   const navigate = useNavigate();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const nameRef = useRef();
   const [nameStatus, setNameStatus] = useState("");
   const [emailStatus, setEmailStatus] = useState("");
   const [passStatus, setPassStatus] = useState("");

   // Chuyển về trang login
   const handleNextPageLogin = () => {
      navigate("/login");
   };

   // Tự focus() vào trường tên
   useEffect(() => {
      if (nameRef.current) nameRef.current.focus();
   }, []);

   // Hàm xử lý đăng kí tài khoản
   const onFinish = async (values) => {
      console.log("Values: ", values);
      try {
         setLoading(true);

         // Gọi API
         const response = await register(values);
         console.log("response ", response);

         if (response) {
            form.resetFields();
            navigate("/login");
            message.success("Đăng ký thành công");
         } else {
            message.error("Đăng ký thất bại, vui lòng thử lại!");
         }
      } catch (error) {
         console.log(error);

         if (error?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data?.email);
         } else {
            message.error("Máy chủ đang gặp sự cố. Vui lòng thử lại sau!");
         }
      } finally {
         setLoading(false);
      }
   };
   return (
      <>
         <div
            id="auth-register"
            className="h-screen flex justify-center items-center"
         >
            <div className="w-[450px] border px-6 py-5 rounded-lg shadow-sm mb-[300px]">
               <header className="text-center font-semibold text-[24px] mb-6">
                  <h3>Đăng ký tài khoản </h3>
               </header>

               <Form
                  onFinish={onFinish}
                  form={form}
                  layout="vertical"
                  name="basic"
                  autoComplete="off"
                  requiredMark={true}
               >
                  <Form.Item
                     hasFeedback
                     validateStatus={nameStatus}
                     label={<span className="font-semibold">Họ và tên</span>}
                     name="fullName"
                     rules={[
                        {
                           required: true,
                           message: "Tên không được để trống",
                        },
                        {
                           pattern:
                              /^[a-zA-ZÀÁẠÃẢẶẴẲẮẰÁĂÂẤẪẨẬẦÃÈẼẺẸÉÊẾỀỄỆỂÌÍỈỊIỢỠỚỜỞÕỌỎÒÓỔỖỐỒỘÔÕƯỨỪỰỮỬỤŨỦÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÊƠàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũơớờợởỡăắằặẳẵâấầậẩẫêếềệểễđĩọỏốồộổỗồờớợởẽẹẻếìíùúụũưữựửữữýỳỵỷỹ ]+$/,
                           message: "Tên chỉ được chứa chữ",
                        },
                     ]}
                  >
                     <Input
                        ref={nameRef}
                        prefix={<UserPen className="size-4" />}
                        placeholder="Nhập tên"
                        className="h-10"
                        onChange={(e) => handleNameChange(e, setNameStatus)}
                     />
                  </Form.Item>
                  <Form.Item
                     hasFeedback
                     validateStatus={emailStatus}
                     label={<span className="font-semibold">Email</span>}
                     name="email"
                     rules={[
                        {
                           required: true,
                           message: "Email không được để trống",
                        },
                        {
                           pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                           message: "Email không hợp lệ",
                        },
                     ]}
                  >
                     <Input
                        prefix={<UserRound className="size-4" />}
                        placeholder="Email"
                        className="h-10"
                        autoComplete="email"
                        onChange={(e) => handleEmailChange(e, setEmailStatus)}
                     />
                  </Form.Item>

                  <Form.Item
                     hasFeedback
                     validateStatus={passStatus}
                     label={<span className="font-semibold">Mật khẩu</span>}
                     name="password"
                     rules={[
                        {
                           required: true,
                           message: "Mật khẩu không được để trống",
                        },
                        {
                           pattern: /^[A-Za-z0-9]{6,}$/,
                           message: "Password phải từ 6 ký tự trở lên",
                        },
                     ]}
                  >
                     <Input.Password
                        prefix={<LockKeyhole className="size-4" />}
                        placeholder="Password"
                        className="h-10"
                        onChange={(e) => handlePasswordChange(e, setPassStatus)}
                     />
                  </Form.Item>

                  <Form.Item label={null}>
                     <Button
                        loading={loading}
                        className="w-full h-10"
                        type="primary"
                        htmlType="submit"
                     >
                        Đăng ký
                     </Button>
                  </Form.Item>
                  <div className="flex items-center justify-center ">
                     <Link
                        onClick={handleNextPageLogin}
                        className="underline font-bold"
                     >
                        Trở về đăng nhập
                     </Link>
                  </div>
               </Form>
            </div>
         </div>
      </>
   );
}
