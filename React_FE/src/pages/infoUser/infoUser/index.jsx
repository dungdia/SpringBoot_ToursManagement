import { AntDesignOutlined } from "@ant-design/icons";
import {
   Button,
   ConfigProvider,
   Form,
   Input,
   message,
   Modal,
   Select,
} from "antd";
import { createStyles } from "antd-style";
import {
   House,
   Mail,
   Mars,
   Phone,
   UserRoundPen,
   Venus,
   VenusAndMars,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import "./infoUser.css";
import {
   findUserInfoByEmail,
   findUserInfoEmailById,
   updateUserInfo,
} from "@/services/userService";
import { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const useStyle = createStyles(({ prefixCls, css }) => ({
   linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(
            .${prefixCls}-btn-dangerous
         ) {
         > span {
            position: relative;
         }

         &::before {
            content: "";
            background: linear-gradient(135deg, #6253e1, #04befe);
            position: absolute;
            inset: -1px;
            opacity: 1;
            transition: all 0.3s;
            border-radius: inherit;
         }

         &:hover::before {
            opacity: 0;
         }
      }
   `,
}));

export default function InfoUser() {
   const navigate = useNavigate();
   const { styles } = useStyle();
   const [form] = Form.useForm();

   const [formUpdateUser] = Form.useForm();
   const fullNameRef = useRef();

   const [user, setUser] = useState({});
   const [baseId, setBaseId] = useState(null);
   const [isUpdateLoading, setIsUpdateLoading] = useState(false);
   const [isShowUpdateModal, setIsShowUpdateModal] = useState(false);

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
      const handleUserInfoUpdate = () => {
         const storedData = localStorage.getItem("accountLogged");
         try {
            const newData = storedData ? JSON.parse(storedData) : {};
            // Cập nhật State, khiến component render lại với dữ liệu mới
            setAccountLogged(newData);
         } catch (e) {
            setAccountLogged({});
         }
      };

      // Lắng nghe sự kiện TÙY CHỈNH 'userInfoUpdate' trên đối tượng window
      window.addEventListener("userInfoUpdate", handleUserInfoUpdate);

      // Dọn dẹp listener khi component unmount
      return () => {
         window.removeEventListener("userInfoUpdate", handleUserInfoUpdate);
      };
   }, []); // Chỉ chạy một lần khi component mount

   // Biến đổi gender thành tiếng việt
   const getDisplayGender = (genderValue) => {
      switch (genderValue) {
         case "MALE":
            return "Nam";
         case "FEMALE":
            return "Nữ";
         case "OTHER":
            return "Khác";
         default:
            return null;
      }
   };

   // Khi accountLogged thay đổi, cập nhật lại giá trị hiển thị thông tin người dùng
   useEffect(() => {
      // Truyền thông tin của admin vào các trường input
      if (accountLogged && form) {
         // Đảm bảo form object tồn tại

         // Tạo bản sao của accountLogged
         const formValues = { ...accountLogged };

         // BIẾN ĐỔI GIÁ TRỊ GENDER
         formValues.gender = getDisplayGender(accountLogged.gender);

         // Thiết lập giá trị đã biến đổi
         form.setFieldsValue(formValues);

         setTimeout(() => {
            // Bắt buộc Form kiểm tra và hiển thị lỗi/success ngay lập tức
            form.validateFields().catch((info) => {
               message.warning("Vui lòng kiểm tra lại thông tin người dùng");
            });
         }, 50);
      }
   }, [accountLogged, form]);

   // Ngăn chặn sự focus của label
   const handlePreventFocus = (e) => {
      e.preventDefault();
   };

   // Xác thực icon giới tính
   const getGenderIcon = (gender) => {
      const iconClass = "size-5 text-slate-600";

      switch (gender) {
         case "MALE":
            return <Mars className={iconClass} />;
         case "FEMALE":
            return <Venus className={iconClass} />;
         case "OTHER":
            return <VenusAndMars className={iconClass} />;
         default:
            return;
      }
   };

   // Hàm lấy thông tin user từ email
   const fetchUser = async () => {
      const response = await findUserInfoByEmail(accountLogged.email);
      setUser(response);
   };

   // Sẽ gọi mỗi khi vào trang user-info
   useEffect(() => {
      fetchUser();
   }, []);

   // Hàm mở modal cập nhật tài khoản
   const handleShowUpdateModal = () => {
      setIsShowUpdateModal(true);
      // Lấy id của user
      setBaseId(user.id);

      formUpdateUser.setFieldsValue(user);

      setTimeout(() => {
         if (fullNameRef.current) fullNameRef.current.focus();
      }, 100);
   };

   // Hàm đóng modal cập nhật tài khoản
   const handleCloseUpdateModal = () => {
      setIsShowUpdateModal(false);
      setBaseId(null);
      formUpdateUser.resetFields();
   };

   // Hàm xử lý khi submit form cập nhật tài khoản
   const onFinishUpdateUser = async (values) => {
      try {
         setIsUpdateLoading(true);

         // Lấy email của user đang được cập nhật
         const responseEmail = await findUserInfoEmailById(baseId);
         const emailToUpdate = responseEmail.data;

         // Kiểm tra xem user đang được cập nhật có phải là user đang đăng nhập không
         const isCurrentUser = accountLogged.email === emailToUpdate;
         // Cập nhật trạng thái cho người dùng
         values.status = true;
         // Gọi API update trước (cho dù là current user hay user khác)
         const response = await updateUserInfo(baseId, values);

         if (response.status === 200) {
            message.success("Cập nhật tài khoản thành công");

            // Xử lý khi cập nhật thành công user đang đăng nhập
            if (isCurrentUser) {
               // KIỂM TRA: Email có thay đổi không?
               if (values.email && values.email !== accountLogged.email) {
                  // Nếu email thay đổi, xóa phiên và yêu cầu đăng nhập lại
                  localStorage.removeItem("accountLogged");
                  Cookies.remove("accessToken");
                  // Chuyển hướng người dùng đến trang đăng nhập (bạn cần có hàm chuyển hướng)
                  navigate("/login");
                  message.warning(
                     "Email đã được thay đổi. Vui lòng đăng nhập lại với email mới."
                  );
                  return; // Ngăn không cho chạy các bước sau
               }

               // Nếu email không thay đổi, chỉ cập nhật thông tin khác trong Local Storage
               const updatedAccount = {
                  ...accountLogged,
                  fullName: values.fullName || accountLogged.fullName,
                  phone: values.phone || accountLogged.phone,
                  address: values.address || accountLogged.address,
                  gender: values.gender || accountLogged.gender,
               };
               localStorage.setItem(
                  "accountLogged",
                  JSON.stringify(updatedAccount)
               );
               // Kích hoạt sự kiện tùy chỉnh
               // Gửi tín hiệu thông báo kiểm tra ai có file nào nhận lắng nghe sự kiện không
               window.dispatchEvent(new Event("userInfoUpdate"));
               message.success("Cập nhật thông tin tài khoản thành công");
            } else {
               // Trường hợp cập nhật user khác: không cần làm gì thêm
               message.info(`Đã cập nhật tài khoản ${emailToUpdate}`);
            }
         } else {
            // Xử lý lỗi từ API (nếu status không phải 200)
            message.error(
               "Cập nhật tài khoản thất bại: Phản hồi không hợp lệ."
            );
            return;
         }
         // Tải lại thông tin user sau khi cập nhật
         fetchUser();
         // Đóng modal
         handleCloseUpdateModal();
      } catch (error) {
         // Xử lý lỗi từ server (CustomException)
         console.log("error", error);

         if (error?.response?.status === HttpStatusCode.BadRequest) {
            message.error(
               error.response.data.phone ||
                  error.response.data.email ||
                  "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
            );
         } else {
            message.error("Đã xảy ra lỗi không xác định.");
         }
      } finally {
         setIsUpdateLoading(false);
      }
   };

   return (
      <>
         {/* Giao diện cập nhật thông tin người dùng */}
         <Modal
            footer={null}
            title="Cập nhật tài khoản"
            onCancel={handleCloseUpdateModal}
            open={isShowUpdateModal}
         >
            <Form
               form={formUpdateUser}
               name="update-account-form"
               layout="vertical"
               initialValues={{ remember: true }}
               autoComplete="off"
               onFinish={onFinishUpdateUser}
            >
               <Form.Item
                  label="Tên người dùng"
                  name="fullName"
                  rules={[
                     {
                        pattern:
                           /^[a-zA-ZÀÁẠÃẢẶẴẲẮẰÁĂÂẤẪẨẬẦÃÈẼẺẸÉÊẾỀỄỆỂÌÍỈỊIỢỠỚỜỞÕỌỎÒÓỔỖỐỒỘÔÕƯỨỪỰỮỬỤŨỦÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÊƠàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũơớờợởỡăắằặẳẵâấầậẩẫêếềệểễđĩọỏốồộổỗồờớợởẽẹẻếìíùúụứừũưữựửữữýỳỵỷỹ ]+$/,
                        message: "Tên chỉ được chứa chữ",
                     },
                     {
                        required: true,
                        message: "Tên người dùng không được bỏ trống!",
                     },
                     {
                        whitespace: true,
                        message: "Tên người dùng không được bỏ trống",
                     },
                  ]}
               >
                  <Input ref={fullNameRef} />
               </Form.Item>
               <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                     {
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email không hợp lệ",
                     },
                     { required: true, message: "Email không được bỏ trống!" },
                     {
                        whitespace: true,
                        message: "Email không được bỏ trống",
                     },
                  ]}
               >
                  <Input placeholder="Nhập email" />
               </Form.Item>

               <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                     {
                        pattern: /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-4|6-9])[0-9]{7}$/,
                        message: "Số điện thoại không hợp lệ",
                     },
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
                  <Input />
               </Form.Item>

               <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                     {
                        required: true,
                        message: "Giới tính không được bỏ trống",
                     },
                     {
                        whitespace: true,
                        message: "Giới tính không được bỏ trống",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn giới tính"
                     style={{ width: 150 }}
                     options={[
                        { value: "MALE", label: "Nam" },
                        { value: "FEMALE", label: "Nữ" },
                        { value: "OTHER", label: "Khác" },
                     ]}
                  />
               </Form.Item>

               <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[
                     {
                        required: true,
                        message: "Địa chỉ không được bỏ trống",
                     },
                     {
                        whitespace: true,
                        message: "Địa chỉ không được bỏ trống",
                     },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item>
                  <div className="flex justify-end gap-2">
                     <Button
                        onClick={handleCloseUpdateModal}
                        type="primary"
                        danger
                        ghost
                        htmlType="button"
                     >
                        Đóng
                     </Button>
                     <Button
                        loading={isUpdateLoading}
                        type="primary"
                        htmlType="submit"
                     >
                        Lưu
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện thông tin người dùng */}
         <div>
            <ConfigProvider
               button={{
                  className: styles.linearGradientButton,
               }}
            >
               <Button
                  onClick={handleShowUpdateModal}
                  type="primary"
                  size="large"
                  icon={<AntDesignOutlined />}
               >
                  Sửa thông tin cá nhân
               </Button>
            </ConfigProvider>
            <div id="info-user" className="mt-6">
               <Form
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
                        prefix={
                           <UserRoundPen className="size-5 text-slate-600" />
                        }
                        className="select-none"
                     />
                  </Form.Item>

                  <div className="flex items-center gap-6 ">
                     <Form.Item
                        hasFeedback
                        label={
                           <div
                              onClick={handlePreventFocus}
                              className="font-bold"
                           >
                              Số điện thoại
                           </div>
                        }
                        name="phone"
                        rules={[
                           {
                              required: true,
                              message: "Địa chỉ không được để trống",
                           },
                           {
                              whitespace: true,
                              message: "Số điện thoại không được bỏ trống",
                           },
                        ]}
                     >
                        <Input
                           prefix={<Phone className="size-5 text-slate-600" />}
                           className="select-none"
                        />
                     </Form.Item>
                     <Form.Item
                        hasFeedback
                        label={
                           <div
                              onClick={handlePreventFocus}
                              className="font-bold"
                           >
                              Giới tính
                           </div>
                        }
                        name="gender"
                        rules={[
                           {
                              required: true,
                              message: "Địa chỉ không được để trống",
                           },
                           {
                              whitespace: true,
                              message: "Giới tính không được bỏ trống",
                           },
                        ]}
                     >
                        <Input
                           prefix={getGenderIcon(accountLogged?.gender)}
                           className="select-none"
                        />
                     </Form.Item>
                  </div>

                  <Form.Item
                     hasFeedback
                     label={
                        <div onClick={handlePreventFocus} className="font-bold">
                           Địa chỉ
                        </div>
                     }
                     name="address"
                     rules={[
                        {
                           required: true,
                           message: "Địa chỉ không được để trống",
                        },
                        {
                           whitespace: true,
                           message: "Địa chỉ không được bỏ trống",
                        },
                     ]}
                  >
                     <Input
                        prefix={<House className="size-5 text-slate-600" />}
                        className="select-none"
                     />
                  </Form.Item>
               </Form>
            </div>
         </div>
      </>
   );
}
