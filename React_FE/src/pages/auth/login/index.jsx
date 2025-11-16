import { Checkbox, Form, Input, Button, message, Modal } from "antd";
import "./login.css";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import Cookies from "js-cookie";
import {
   login,
   loginWithFacebook,
   loginWithGoogle,
} from "@/services/authService";
import { decryptData, encryption, encryptPassword } from "@/utils/CryptoJS";
import bcrypt from "bcryptjs";
import {
   handleEmailChange,
   handlePasswordChange,
   validateEmail,
   validatePassword,
} from "@/utils/vaidate";
import {
   changePassByEmail,
   findUserByEmail,
   getCodeOTP,
   sendPasswordEmailOrInfoEmail,
} from "@/services/adminService";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

// Cú pháp lưu cookie và lấy cookie

export default function Login() {
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const emailRef = useRef();
   const [form] = Form.useForm(); // Form cho chức năng chính

   const [rememberAccount, setRememberAccount] = useState(false);
   const [emailStatus, setEmailStatus] = useState("");
   const [valueEmail, setValueEmail] = useState("");
   const [passStatus, setPassStatus] = useState("");
   const [valuePass, setValuePass] = useState("");

   const [formEmail] = Form.useForm(); // Form cho email
   const [formForgotPassword] = Form.useForm(); // Form cho chức năng mật khẩu
   const [isShowForgotPassword, setIsShowForgotPassword] = useState(false);
   const [isShowOPT, setIsShowOPT] = useState(false);
   const otpRef = useRef();
   const [isLoadingForgotPass, setIsLoadingForgotPass] = useState(false);
   const [valueOTP, setValueOTP] = useState("");
   const [isOTPLoading, setIsOTPLoading] = useState(false);
   const emailRefForgotPass = useRef();
   const [emailOTPStatus, setEmailOTPStatus] = useState("");
   const [passOTPStatus, setPassOTPStatus] = useState("");
   const [rePassOTPStatus, setRePassOTPStatus] = useState("");
   const [currentPassword, setCurrentPassword] = useState("");

   // Tự focus vào email khi vào trang login và tự động điền giá trị nếu trong localStorage đã có savedAccount khi nhấn "Nhớ tài khoản"
   useEffect(() => {
      const savedAccount = JSON.parse(localStorage.getItem("savedAccount"));
      if (savedAccount) {
         // Giải mã email và password trước khi điền vào form
         const decryptedEmail = decryptData(savedAccount.email);
         setValueEmail(decryptedEmail);

         const beforeEncryption = sessionStorage.getItem("beforeEncryption");
         // So sánh mật khẩu đã mã hóa (beforeEncryption.current) với mật khẩu lưu trong savedAccount
         bcrypt
            .compare(beforeEncryption, savedAccount.password)
            .then((isPasswordCorrect) => {
               if (isPasswordCorrect) {
                  // Giải mã mật khẩu sau khi xác nhận đúng mật khẩu
                  const decryptedPassword = decryptData(beforeEncryption);
                  setValuePass(decryptedPassword);
                  // Cập nhật giá trị vào form
                  form.setFieldsValue({
                     email: decryptedEmail,
                     password: decryptedPassword,
                  });
               } else {
                  form.setFieldsValue({
                     email: decryptedEmail,
                     password: "", // Đảm bảo mật khẩu không bị hiển thị
                  });
               }
            })
            .catch((err) => {
               // Cập nhật giá trị vào form
               form.setFieldsValue({
                  email: decryptedEmail,
                  password: "",
               });
            });

         setRememberAccount(true); //Đặt trạng thái checkbox về true
      }
      if (emailRef.current) {
         emailRef.current.focus();
      }
   }, []);

   // Nếu có email và password có giá trị điền sẵn khi đăng xuất (bấm lưu tài khoản) thì sẽ hiện trạng thái validateStatus
   useEffect(() => {
      setTimeout(() => {
         // Lấy giá trị email và password ban đầu từ Ant Design Form
         const initialEmail = form.getFieldValue("email");
         const initialPass = form.getFieldValue("password");

         //  Kiểm tra và cập nhật trạng thái EMAIL
         if (initialEmail) {
            // Có giá trị: Kiểm tra hợp lệ
            if (validateEmail(initialEmail)) {
               setEmailStatus("success");
            } else {
               setEmailStatus("error");
            }
         } else {
            // Không có giá trị (null/undefined/'')
            setEmailStatus(""); // Reset trạng thái (để không hiện lỗi/success)
         }

         //  Kiểm tra và cập nhật trạng thái PASSWORD
         if (initialPass) {
            // Có giá trị: Kiểm tra hợp lệ
            if (validatePassword(initialPass)) {
               setPassStatus("success");
            } else {
               setPassStatus("error");
            }
         } else {
            // Không có giá trị (null/undefined/'')
            setPassStatus(""); // Reset trạng thái
         }
      }, 50);
   }, []);

   // Kiểm tra xem người dùng đã đăng nhập chưa, nếu rồi thì quay lại trang chủ
   useEffect(() => {
      // kiểm tra token từ cookie
      const accessToken = Cookies.get("accessToken");
      // Lấy thông tin user từ localStorage
      const accountLogged =
         JSON.parse(localStorage.getItem("accountLogged")) || {};

      if (accessToken) {
         const checkIsAdmin = accountLogged?.roles?.some(
            (role) => role === "ROLE_ADMIN" || role === "ROLE_OWNER"
         );

         if (checkIsAdmin) {
            // Điều hướng về trang admin
            navigate("/admin");
         } else {
            // Điều hướng về trang user
            navigate("/user");
         }
      }
   }, []);

   // Hàm xác định đăng nhập
   const onFinish = async (values) => {
      try {
         // Hiển thị loading
         setIsLoading(true);

         // Gọi API đăng nhập ở đây
         const response = await login(values);

         // Dùng distructuring để lấy key từ object
         const { accessToken, ...filterData } = response;

         // Lưu token vào cookie
         Cookies.set("accessToken", accessToken, {
            expires: 1, // Cookie hết hạn sau 1 ngày
            secure: true, // Chỉ gửi cookie qua kết nối HTTPS
            sameSite: "strict", // Chống tấn công CSRF
         });

         // Lưu thông tin cá nhân của user vào localStorage
         localStorage.setItem("accountLogged", JSON.stringify(filterData));

         // Chuyển trang dựa vào quyền hạn
         // Kiểm tra user có phải admin hay không
         const checkIsAdmin = filterData?.roles.some(
            (role) => role === "ROLE_ADMIN" || role === "ROLE_OWNER"
         );

         // Khi nhấn ghi "nhớ tài khoản"
         if (rememberAccount) {
            // Mã hóa email
            const encryptedEmail = encryption(values.email);
            // Mã hóa mật khẩu nhẹ
            const lightEncryption = encryption(values.password);
            // Lưu giá trị beforeEncryption vào sessionStorage
            sessionStorage.setItem("beforeEncryption", lightEncryption);
            // Mã hóa mật khẩu trước khi gửi tới server
            const encryptedPassword = await encryptPassword(lightEncryption);
            // Lưu vào localStorage khi nhấn "Nhớ tài khoản"
            localStorage.setItem(
               "savedAccount",
               JSON.stringify({
                  email: encryptedEmail, // Lưu mật email đã mã hóa
                  password: encryptedPassword, // Lưu mật khẩu đã mã hóa
               })
            );
         } else {
            // Xóa khỏi localStorage
            localStorage.removeItem("savedAccount");
         }

         if (checkIsAdmin) {
            // Điều hướng về trang admin
            navigate("/admin");
         } else {
            // Điều hướng về trang user
            navigate("/user");
         }

         message.success("Đăng nhập thành công!");
      } catch (error) {
         if (error?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data?.error);
            return;
         } else {
            message.error("Máy chủ đang gặp sự cố. Vui lòng thử lại sau!");
            return;
         }
      } finally {
         // Tắt loading
         setIsLoading(false);
      }
   };

   // Hàm mở quên mật khẩu
   const handleShowForgotPassword = () => {
      setIsShowForgotPassword(true);

      formEmail.resetFields();
      setEmailOTPStatus("");

      setTimeout(() => {
         if (emailRefForgotPass.current) {
            emailRefForgotPass.current.focus();
         }
      }, 100);
   };

   useEffect(() => {
      if (isShowForgotPassword && emailRefForgotPass.current) {
         emailRefForgotPass.current.focus();
      }
   }, [isShowForgotPassword]);

   // Hàm đóng quên mật khẩu
   const handleCloseForgotPassword = () => {
      setIsShowForgotPassword(false);
      formEmail.resetFields();
      setEmailOTPStatus("");
   };

   // Hàm lưu email vào cookie
   const saveEmailToCookie = (email) => {
      Cookies.set("email", email, {
         expires: 1, // Cookie hết hạn sau 1 ngày
         secure: true, // Giới hạn truy cập cookie chỉ qua https
         sameSite: "strict", // Giới hạn cookie chỉ gửi trong cùng miền
      });
   };

   // Hàm xử lý quên mật khẩu
   const handleGetPassword = async () => {
      try {
         const values = await formEmail.validateFields();
         const { email } = values;

         setIsLoadingForgotPass(true);

         // Gọi API
         const response = await findUserByEmail(email);
         if (response) {
            // Lưu email lên cookie
            saveEmailToCookie(email);
            message.success("Qua bước xác nhận OPT!");
            handleOpenOPT();
            handleCloseForgotPassword();
            formEmail.resetFields();
         } else {
            message.error("Email không xác nhận vui lòng thử lại!");
         }
      } catch (error) {
         console.log("Error: ", error);

         if (error?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data?.error);
         } else message.error("Có lỗi xảy ra, vui lòng thử lại!");
      } finally {
         setIsLoadingForgotPass(false);
      }
   };

   // Hàm đóng mã OPT và lấy mk
   const handlCloseOTP = () => {
      setIsShowOPT(false);
      setEmailOTPStatus("");
      setPassOTPStatus("");
      setRePassOTPStatus("");
      Cookies.remove("email");
      formForgotPassword.resetFields();
   };

   // Hàm mở mã OPT và lấy mk
   const handleOpenOPT = async () => {
      setIsShowOPT(true);

      const email = Cookies.get("email");
      try {
         const response = await getCodeOTP(email);

         if (response) {
            setValueOTP(response.data.otp);
            message.success(response.data.message);
         }

         // Thời gian hết hạn của mã OTP (1 PHÚT)
         const OTP_TIMEOUT_MS = 1 * 60 * 1000;

         setTimeout(() => {
            // Đặt lại state về rỗng/null sau 1 phút
            setValueOTP(null);

            // Tùy chọn: Gửi thông báo cho người dùng
            message.warning(
               "Mã xác nhận (OTP) đã hết hạn. Vui lòng lấy lại mã."
            );

            // Đóng modal OTP
            handlCloseOTP();
         }, OTP_TIMEOUT_MS);

         setEmailOTPStatus("");
         setPassOTPStatus("");
         setRePassOTPStatus("");
         formForgotPassword.resetFields();

         setTimeout(() => {
            if (otpRef.current) {
               otpRef.current.focus();
            }
         }, 10);
      } catch (error) {
         message.error("Quá trình gửi mã đã thất bại. Vui lòng thử lại sau!");
      }
   };

   // Tự focus vào input OTP
   useEffect(() => {
      setTimeout(() => {
         if (otpRef.current) {
            otpRef.current.focus();
         }
      }, 10);
   }, [isShowOPT]);

   // Hàm xác nhận mã OPT và lấy mk
   const handleConfirmOPT = async () => {
      const email = Cookies.get("email"); // Lấy email từ cookie
      const values = await formForgotPassword.validateFields();
      const { opt, newPassword, rePassword } = values; // Lấy các giá trị từ form

      // Kiểm tra mã OTP
      if (opt !== valueOTP) {
         // Nếu mã OTP không chính xác
         message.error("Mã OTP không chính xác");
         return;
      }

      // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp không
      if (newPassword !== rePassword) {
         // Nếu mật khẩu và xác nhận mật khẩu không giống nhau
         message.error("Mật khẩu xác nhận không đúng");
         return;
      }

      // Gọi API để thay đổi mật khẩu
      try {
         setIsOTPLoading(true);
         const response = await changePassByEmail(email, newPassword); // Gọi API thay đổi mật khẩu
         console.log("response: ", response);

         if (response) {
            // Nếu đổi mật khẩu thành công
            message.success("Mật khẩu đã được lấy lại thành công");
            handlCloseOTP();
            setEmailOTPStatus("");
            setPassOTPStatus("");
            setRePassOTPStatus("");
         } else {
            // Nếu có lỗi khi thay đổi mật khẩu
            message.error("Đã xảy ra lỗi khi thay lấy lại mật khẩu");
         }
      } catch (error) {
         // Xử lý lỗi nếu có
         message.error("Đã xảy ra lỗi, vui lòng thử lại sau");
         console.error(error);
      } finally {
         setIsOTPLoading(false);
      }
   };

   // gọi lại handleEmailChange khi dữ liệu email thay đổi hoặc handlePasswordChange khi dữ liệu email thay
   useEffect(() => {
      if (valueEmail) {
         handleEmailChange({ target: { value: valueEmail } }, setEmailStatus);
      }
      if (valuePass) {
         handlePasswordChange({ target: { value: valuePass } }, setPassStatus);
      }
   }, [valueEmail, valuePass]); // Chạy lại mỗi khi valueEmail hoặc valuePass thay đổi

   // Hàm cập nhận validationStatus cho rePassword
   const handleRePassword = (e) => {
      const rePassword = e.target.value;
      setCurrentPassword(rePassword);
      const password = formForgotPassword.getFieldValue("newPassword");
      console.log("password ", password);

      if (!rePassword) {
         setRePassOTPStatus("");
      } else if (rePassword === password) {
         setRePassOTPStatus("success");
      } else {
         setRePassOTPStatus("error");
      }
   };

   // Chuyển qua trang đăng ký tài khoản
   const handleNextPageResgiter = () => {
      navigate("/register");
   };

   // Hàm login vào bằng Google
   const handleGoogleLoginSuccess = async (credentialResponse) => {
      try {
         const decoded = jwtDecode(credentialResponse.credential);
         const email = decoded.email;
         const name = decoded.name;

         // Gọi API đăng nhập
         const response = await loginWithGoogle(email, name);

         // Kiểm tra phản hồi API
         if (!response || !response.accessToken || !response.roles) {
            message.error(
               "Đăng nhập Google thất bại! Không nhận được dữ liệu hợp lệ."
            );
            return;
         }

         // Xử lý dữ liệu
         const { accessToken, ...filterData } = response;

         // Gửi email (Chỉ khi đăng nhập chắc chắn thành công)
         const sendEmail = await sendPasswordEmailOrInfoEmail(filterData.email);

         if (sendEmail) {
            message.success(sendEmail.data.message);
         }

         // Lưu token vào cookie
         Cookies.set("accessToken", accessToken, {
            expires: 1, // Cookie hết hạn sau 1 ngày
            secure: true, // Chỉ gửi cookie qua kết nối HTTPS
            sameSite: "strict", // Chống tấn công CSRF
         });

         // Lưu thông tin cá nhân của user vào localStorage
         localStorage.setItem("accountLogged", JSON.stringify(filterData));

         // Chuyển trang dựa vào quyền hạn
         const checkIsAdmin = filterData.roles.some(
            (role) => role === "ROLE_ADMIN" || role === "ROLE_OWNER"
         );

         if (checkIsAdmin) {
            navigate("/admin");
         } else {
            navigate("/user");
         }

         // Thông báo thành công cuối cùng
         message.success("Đăng nhập bằng Google thành công!");
      } catch (err) {
         message.error("Đăng nhập Google thất bại! Đã xảy ra lỗi hệ thống.");
      }
   };

   // Hàm login vào bằng Facebook
   const handleFacebookLogin = () => {
      if (typeof FB === "undefined") {
         message.error(
            "Facebook SDK chưa được tải. Vui lòng đợi hoặc làm mới trang."
         );
         return;
      }

      FB.login(
         function (response) {
            if (response.authResponse) {
               FB.api(
                  "/me",
                  { fields: "name,email" },
                  async function (userInfo) {
                     try {
                        const email = userInfo.email;
                        const name = userInfo.name;
                        console.log(userInfo);

                        console.log("Email từ Facebook:", email);
                        console.log("Tên từ Facebook:", name);

                        if (!email) {
                           // Nếu email không tồn tại (undefined), hiển thị thông báo lỗi rõ ràng
                           message.error(
                              "Đăng nhập thất bại: Facebook không chia sẻ địa chỉ Email của bạn. Vui lòng đảm bảo bạn đã cấp quyền truy cập email trong hộp thoại đăng nhập của Facebook."
                           );
                           return; // Dừng tiến trình đăng nhập
                        }

                        // Gọi API backend của bạn
                        const res = await loginWithFacebook(email, name);

                        const { accessToken, ...filterData } = res;

                        // Gửi email (Chỉ khi đăng nhập chắc chắn thành công)
                        const sendEmail = await sendPasswordEmailOrInfoEmail(
                           filterData.email
                        );

                        if (sendEmail) {
                           message.success(sendEmail.data.message);
                        }

                        Cookies.set("accessToken", accessToken, {
                           expires: 1,
                           secure: true,
                           sameSite: "strict",
                        });

                        localStorage.setItem(
                           "accountLogged",
                           JSON.stringify(filterData)
                        );

                        const isAdmin = filterData.roles.includes(
                           "ROLE_ADMIN" || "ROLE_OWNER"
                        );
                        navigate(isAdmin ? "/admin" : "/user");

                        message.success("Đăng nhập bằng Facebook thành công!");
                     } catch (err) {
                        message.error("Đăng nhập Facebook thất bại!");
                     }
                  }
               );
            } else {
               message.error("Bạn đã hủy đăng nhập Facebook!");
            }
         },
         { scope: "email,public_profile" }
      );
   };

   return (
      <>
         {/* Modal xác nhận mã OTP */}
         <Modal
            open={isShowOPT}
            onCancel={handlCloseOTP}
            footer={
               <div className="flex justify-end gap-2">
                  <Button
                     onClick={handlCloseOTP}
                     color="danger"
                     variant="outlined"
                  >
                     Đóng
                  </Button>
                  <Button
                     loading={isOTPLoading}
                     onClick={handleConfirmOPT}
                     type="primary"
                  >
                     Xác nhận
                  </Button>
               </div>
            }
         >
            <Form
               form={formForgotPassword}
               requiredMark={false}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  label={<div className="font-bold">Mã OTP</div>}
                  name="opt"
                  rules={[
                     {
                        required: true,
                        message: "Mã OPT không được bỏ trống",
                     },
                  ]}
               >
                  <Input ref={otpRef} />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus={passOTPStatus}
                  label={<div className="font-bold">Mật khẩu mới</div>}
                  name="newPassword"
                  rules={[
                     {
                        required: true,
                        message: "Password không được bỏ trống",
                     },
                     {
                        pattern: /^[A-Za-z0-9]{6,}$/,
                        message:
                           "Password phải từ 6 ký tự trở lên, không lấy kí tự đặc biệt",
                     },
                  ]}
               >
                  <Input.Password
                     onChange={(e) => handlePasswordChange(e, setPassOTPStatus)}
                     placeholder="Nhập password mới"
                  />
               </Form.Item>

               <Form.Item
                  hasFeedback
                  validateStatus={rePassOTPStatus}
                  label={<div className="font-bold">Viết lại mật khẩu</div>}
                  name="rePassword"
                  rules={[
                     {
                        required: true,
                        message: "Viết lại password",
                     },
                     {
                        pattern: /^[A-Za-z0-9]{6,}$/,
                        message: "Password phải từ 6 ký tự trở lên",
                     },
                  ]}
               >
                  <Input.Password
                     value={currentPassword}
                     onChange={handleRePassword}
                     placeholder="Nhập lại password"
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Modal quên mật khẩu */}
         <Modal
            title="Gửi mã OTP qua Email"
            open={isShowForgotPassword}
            onCancel={handleCloseForgotPassword}
            footer={
               <div className="flex justify-end gap-2">
                  <Button
                     onClick={handleCloseForgotPassword}
                     color="danger"
                     variant="outlined"
                  >
                     Đóng
                  </Button>
                  <Button
                     onClick={handleGetPassword}
                     type="primary"
                     loading={isLoadingForgotPass}
                  >
                     Gửi
                  </Button>
               </div>
            }
         >
            <Form
               form={formEmail}
               requiredMark={false}
               layout="vertical"
               autoComplete="off"
            >
               <Form.Item
                  hasFeedback
                  validateStatus={emailOTPStatus}
                  label={<div className="font-bold">Email</div>}
                  name="email"
                  rules={[
                     {
                        required: true,
                        message: "email không được bỏ trống",
                     },
                     {
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "email không hợp lệ",
                     },
                  ]}
               >
                  <Input
                     onChange={(e) => handleEmailChange(e, setEmailOTPStatus)}
                     placeholder="Email"
                     autoComplete="email"
                     ref={emailRefForgotPass}
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Form login */}
         <div
            id="auth-login"
            className="h-screen flex justify-center items-center"
         >
            <div className="w-[450px] border px-6 py-5 rounded-lg shadow-sm mb-[300px]">
               <header className="text-center font-semibold text-[24px] mb-6">
                  <h3>Đăng nhập để sử dụng hệ thống</h3>
               </header>

               <Form
                  form={form}
                  name="basic"
                  layout="vertical"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  autoComplete="off"
               >
                  <Form.Item
                     hasFeedback
                     validateStatus={emailStatus}
                     required={false}
                     label={<span className="font-semibold">Email</span>}
                     name="email"
                     rules={[
                        {
                           type: "email",
                           message: "Nhập đúng định dạng email!",
                        },
                        {
                           required: true,
                           message: "Email không được để trống!",
                        },
                     ]}
                  >
                     <Input
                        ref={emailRef}
                        autoComplete="email"
                        className="h-10"
                        value={valueEmail}
                        onChange={(e) => handleEmailChange(e, setEmailStatus)}
                     />
                  </Form.Item>

                  <Form.Item
                     hasFeedback
                     validateStatus={passStatus}
                     required={false}
                     label={<span className="font-semibold">Mật khẩu</span>}
                     name="password"
                     rules={[
                        {
                           regexp: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                           message:
                              "Mật khẩu tối thiểu 6 ký tự, bao gồm chữ cái và số.",
                        },
                        {
                           required: true,
                           message: "Password không được để trống!",
                        },
                     ]}
                  >
                     <Input.Password
                        value={valuePass}
                        onChange={(e) => handlePasswordChange(e, setPassStatus)}
                        className="h-10"
                     />
                  </Form.Item>

                  <Form.Item>
                     <div className="text-center flex justify-between">
                        <Link
                           onClick={handleShowForgotPassword}
                           className="text-[15px]"
                        >
                           Quên mật khẩu
                        </Link>
                        <div>
                           <Checkbox
                              checked={rememberAccount}
                              className="italic"
                              onChange={(e) =>
                                 setRememberAccount(e.target.checked)
                              }
                           >
                              Nhớ mật khẩu
                           </Checkbox>
                        </div>
                     </div>
                  </Form.Item>

                  <Form.Item label={null}>
                     <Button
                        loading={isLoading}
                        className="w-full h-10"
                        type="primary"
                        htmlType="submit"
                     >
                        Đăng nhập
                     </Button>
                     {/* Đăng nhập bằng Google */}
                  </Form.Item>
                  <Form.Item className="flex justify-center items-center">
                     <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={() => {
                           message.error("Đăng nhập Google thất bại");
                        }}
                     />
                     <Button
                        className="mt-5"
                        type="primary"
                        onClick={handleFacebookLogin}
                     >
                        Đăng nhập bằng Facebook
                     </Button>
                  </Form.Item>
                  <div className="flex justify-center">
                     <Link
                        onClick={handleNextPageResgiter}
                        className="underline text-[16 px] font-semibold"
                     >
                        Đăng ký tài khoản
                     </Link>
                  </div>
               </Form>
            </div>
         </div>
      </>
   );
}
