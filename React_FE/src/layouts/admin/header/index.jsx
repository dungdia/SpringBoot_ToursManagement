import { Avatar, Button, Dropdown, Form, Input, message, Modal } from "antd";
import { Bell, Mail, Phone, UserRoundPen } from "lucide-react";
import "./header.css";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import {
   changePassByEmail,
   checkCurrentPassword,
} from "@/services/adminService";
import { handleEmailChange, handleNewPasswordChange } from "@/utils/vaidate";

export default function Header() {
   const navigate = useNavigate();
   const [isShowModal, setIsShowModal] = useState(false);

   const [form] = Form.useForm();
   const [isShowInfoModal, setIsShowInfoModal] = useState(false);

   const [isShowChangePass, setIsShowChangePass] = useState(false);
   const [formChangePass] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [emailStatus, setEmailStatus] = useState("");
   const [passwordStatus, setPasswordStatus] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");
   const emailRef = useRef(null);
   const [newPasswordStatus, setNewPasswordStatus] = useState("");

   // CHUYỂN accountLogged THÀNH STATE (Sử dụng lazy initialization)
   const [accountLogged, setAccountLogged] = useState(() => {
      const storedData = localStorage.getItem("accountLogged");
      try {
         return storedData ? JSON.parse(storedData) : {};
      } catch (e) {
         console.error("Lỗi parse localStorage:", e);
         return {};
      }
   });

   // Sử dụng useEffect để lắng nghe sự kiện TÙY CHỈNH
   // Sự kiện này được kích hoạt khi việc cập nhật user thành công ở file khác.
   useEffect(() => {
      // Hàm này sẽ được gọi khi có sự kiện tùy chỉnh 'userUpdated'
      const handleUserUpdate = () => {
         console.log(
            "Dữ liệu user trong localStorage đã được cập nhật. Đang tải lại..."
         );
         const storedData = localStorage.getItem("accountLogged");
         try {
            const newData = storedData ? JSON.parse(storedData) : {};
            // Cập nhật State, khiến component render lại với dữ liệu mới
            setAccountLogged(newData);
         } catch (e) {
            console.error("Lỗi đồng bộ localStorage:", e);
            setAccountLogged({});
         }
      };

      // Lắng nghe sự kiện TÙY CHỈNH 'userUpdated' trên đối tượng window
      window.addEventListener("userUpdated", handleUserUpdate);

      // Dọn dẹp listener khi component unmount
      return () => {
         window.removeEventListener("userUpdated", handleUserUpdate);
      };
   }, []); // Chỉ chạy một lần khi component mount

   // Hàm mở modal thông tin admin
   const handleShowInfoModal = () => {
      setIsShowInfoModal(true);

      // Truyền thông tin của admin vào các trường input
      if (accountLogged) {
         form.setFieldsValue(accountLogged);

         setTimeout(() => {
            // Bắt buộc Form kiểm tra và hiển thị lỗi/success ngay lập tức
            form.validateFields().catch((info) => {
               // Chỉ dùng console.log để debug, không cần thiết cho logic sản phẩm
               console.log("Validation Errors:", info);
            });
         }, 10); // Độ trễ 10ms
      }
   };

   // Hàm đóng modal thông tin admin
   const handleCloseInfoModal = () => {
      setIsShowInfoModal(false);
   };

   // Hàm mở modal xác nhận đăng xuất
   const handleShowModal = () => {
      setIsShowModal(true);
   };

   // Hàm mở modal đổi mật khẩu
   const handleShowChangePass = () => {
      setIsShowChangePass(true);
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      formChangePass.resetFields();
      setTimeout(() => {
         if (emailRef.current) {
            emailRef.current.focus();
         }
      }, 100);
   };

   // Tự động focus vào trường email khi đổi pass
   useEffect(() => {
      if (isShowChangePass && emailRef.current) {
         emailRef.current.focus();
      }
   }, [isShowChangePass]);

   // Hàm đóng modal đổi mật khẩu
   const handleCloseChangePass = () => {
      setIsShowChangePass(false);
      setEmailStatus("");
      setPasswordStatus("");
      setNewPasswordStatus("");
      formChangePass.resetFields();
   };

   // Hàm đóng modal xác nhận đăng xuất
   const handleCloseModal = () => {
      setIsShowModal(false);
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

         const isCurrentPasswordCorrect = await checkCurrentPassword(
            password,
            email
         );

         if (!isCurrentPasswordCorrect) {
            message.error("Mật khẩu hiện tại không đúng!");
            setLoading(false); // Dừng loading nếu mật khẩu sai
            return;
         }

         // Gọi API
         const response = await changePassByEmail(
            accountLogged.email,
            newPassword
         );

         if (response) {
            message.success("Đổi mật khẩu thành công!");
            handleCloseChangePass(); // Đóng modal sau khi đổi mật khẩu thành công
            setEmailStatus("");
            setPasswordStatus("");
            setNewPasswordStatus("");
            setIsShowChangePass(false);
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

   // Hàm đăng xuất tài khoản
   const handleLogout = () => {
      // Xóa token khỏi cookie
      Cookies.remove("accessToken");
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem("accountLogged");
      // Chuyển về trang login
      navigate("/login");
      // Đóng modal
      message.success("Đăng xuất thành công");
   };

   const items = [
      {
         key: "1",
         label: <div onClick={handleShowInfoModal}>Thông tin cá nhân</div>,
      },
      {
         key: "2",
         label: <div onClick={handleShowChangePass}>Đổi mật khẩu</div>,
      },
      {
         type: "divider",
      },
      {
         key: "3",
         label: <div onClick={handleShowModal}>Đăng xuất</div>,
      },
   ];

   // Ngăn chặn sự focus của label
   const handlePreventFocus = (e) => {
      e.preventDefault();
   };

   // Hàm xử lý onChanePassword
   const handlePasswordChange = async (e) => {
      const password = e.target.value;
      setCurrentPassword(password);
   };

   // Sử dụng useDebounce để debounce giá trị password
   const debouncedPassword = useDebounce(currentPassword, 800);
   
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
               const isPasswordCorrect = await checkCurrentPassword(
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
         {/* Modal đổi mật khẩu */}
         <Modal
            open={isShowChangePass}
            onCancel={handleCloseChangePass}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseChangePass} type="primary" ghost>
                     Hủy
                  </Button>
                  <Button
                     onClick={handleChangePass}
                     type="primary"
                     danger
                     loading={loading}
                  >
                     Lưu
                  </Button>
               </div>
            }
         >
            <Form
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
                        message: "Password mưới không được để trống",
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
            </Form>
         </Modal>

         {/* Modal hiện thông tin của admin */}
         <Modal
            id="admin-header-info"
            footer={null}
            onCancel={handleCloseInfoModal}
            open={isShowInfoModal}
         >
            <Form
               id="admin-header-info"
               color="red"
               requiredMark={false}
               form={form}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  label={
                     <div onClick={handlePreventFocus} className="font-bold">
                        Email
                     </div>
                  }
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: "Email không được bỏ trống",
                     },
                     {
                        whitespace: true,
                        message: "Email không được bỏ trống",
                     },
                  ]}
               >
                  <Input
                     prefix={<Mail className="size-5 text-slate-600" />}
                     className="select-none"
                  />
               </Form.Item>
               <Form.Item
                  hasFeedback
                  label={
                     <div onClick={handlePreventFocus} className="font-bold">
                        Họ và tên
                     </div>
                  }
                  name="fullName"
                  rules={[
                     {
                        required: true,
                        message: "Tên không được để trống",
                     },
                     {
                        whitespace: true,
                        message: "Tên không được bỏ trống",
                     },
                  ]}
               >
                  <Input
                     prefix={<UserRoundPen className="size-5 text-slate-600" />}
                     className="select-none"
                  />
               </Form.Item>
               <Form.Item
                  hasFeedback
                  label={
                     <div onClick={handlePreventFocus} className="font-bold">
                        Số điện thoại
                     </div>
                  }
                  name="phone"
                  rules={[
                     {
                        required: true,
                        message: "Số điện thoại không được để trống",
                     },
                     {
                        whitespace: true,
                        message: "Số điện thoại không được bỏ trống",
                     },
                  ]}
               >
                  <Input
                     prefix={<Phone className="size-5 text-slate-600" />}
                     className="select-none font-normal text-red-400"
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Modal đăng xuất */}
         <Modal
            onCancel={handleCloseModal}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModal} type="primary" ghost>
                     Hủy
                  </Button>
                  <Button onClick={handleLogout} type="primary" danger>
                     Đăng xuất
                  </Button>
               </div>
            }
            title="Xác nhận"
            open={isShowModal}
         >
            <p>Bạn có chắc chắn muốn đăng xuất không?</p>
         </Modal>

         {/* Giao diện chính */}
         <header
            id="admin-header"
            className="w-full h-16 bg-slate-400 flex justify-between items-center px-12"
         >
            <h2>Logo</h2>
            <div className="flex items-center gap-5">
               <Bell className="cursor-pointer text-white" />
               <Dropdown
                  className="cursor-pointer"
                  placement="bottomLeft"
                  arrow={{ pointAtCenter: false }}
                  menu={{
                     items,
                  }}
                  trigger={["click"]}
               >
                  <Avatar className="ant-avatar">
                     {accountLogged?.fullName?.charAt(0)}
                  </Avatar>
               </Dropdown>
            </div>
         </header>
      </>
   );
}
