import {
   Button,
   Checkbox,
   Form,
   Input,
   message,
   Modal,
   Pagination,
   Select,
   Table,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./accountManager.css";
import { HttpStatusCode } from "axios";
import {
   findEmailById,
   getAllRoleName,
   getAllUsers,
   removeUser,
   unblockStatus,
   updateUser,
} from "@/services/adminService";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDebounce } from "@/hooks/useDebounce";

export default function AccountManager() {
   const [isLoading, setIsLoading] = useState(false);
   const [users, setUsers] = useState([]);
   const [roleNames, setRoleNames] = useState([]);
   const fullNameRef = useRef();

   const [baseId, setBaseId] = useState(null);

   const [isShowUpdateModal, setIsShowUpdateModal] = useState(false);
   const [formUpdateUser] = Form.useForm();
   const [isUpdateLoading, setIsUpdateLoading] = useState(false);
   const navigate = useNavigate();

   const [isCurrentUser, setIsCurrentUser] = useState(false);

   const [isShowModalDelete, setIsShowModalDelete] = useState(false);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);

   const [isShowUnblockStatus, setIsShowUnblockStatus] = useState(false);
   const [isUnblockLoading, setIsUnblockLoading] = useState(false);

   const [totalElements, setTotalElements] = useState(0);
   const [searchValue, setSearchValue] = useState("");
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(5);
   const [checkStatusUser, setCheckStatusUser] = useState("all");
   const [checkGenderUser, setCheckGenderUser] = useState("all");

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogged =
      JSON.parse(localStorage.getItem("accountLogged")) || {};

   const columns = [
      {
         title: "Tên tài khoản",
         dataIndex: "fullName",
         key: "fullName",
         render: (_, user) => (
            <p title={user.fullName} className="format">
               {user.fullName}
            </p>
         ),
      },
      {
         title: "Email",
         dataIndex: "email",
         key: "email",
         render: (_, user) => (
            <p title={user.email} className="format">
               {user.email}
            </p>
         ),
      },
      {
         title: "Số điện thoại",
         dataIndex: "phone",
         key: "phone",
         render: (_, user) => (
            <p
               title={user.phone === null ? "Chưa có" : user.phone}
               className={
                  user.phone === null
                     ? "format font-semibold text-red-500"
                     : "format"
               }
            >
               {user.phone === null ? "Chưa có" : user.phone}
            </p>
         ),
      },
      {
         title: "Giới tính",
         dataIndex: "gender",
         key: "gender",
         render: (_, user) => {
            const genderText =
               user.gender === "MALE"
                  ? "Nam"
                  : user.gender === "FEMALE"
                  ? "Nữ"
                  : user.gender === "OTHER"
                  ? "Khác"
                  : "Chưa có";
            const genderClass =
               user.gender === "MALE"
                  ? "text-blue-500"
                  : user.gender === "FEMALE"
                  ? "text-pink-500"
                  : user.gender === "OTHER"
                  ? "text-yellow-500"
                  : "text-red-500";
            return (
               <p
                  title={genderText}
                  className={`format font-semibold ${genderClass}`}
               >
                  {genderText}
               </p>
            );
         },
      },
      {
         title: "Vai trò",
         dataIndex: "roles",
         key: "roles",
         render: (_, user) => {
            const rolesArray =
               user.arrRoles?.map((role) => role.roleName) || [];
            let baseClass = "font-semibold format";
            return (
               <p className={baseClass} title={rolesArray.join(", ")}>
                  {rolesArray.map((role, index) => (
                     <span
                        key={index}
                        className={
                           role === "ROLE_ADMIN"
                              ? "text-red-400"
                              : role === "ROLE_USER"
                              ? "text-green-400"
                              : "text-[#001529fc]"
                        }
                     >
                        {role}
                        {index < rolesArray.length - 1 ? ", " : ""}
                     </span>
                  ))}
               </p>
            );
         },
      },
      {
         title: "Địa chỉ",
         dataIndex: "address",
         key: "address",
         render: (_, user) => (
            <p title={user.address} className="format">
               {user.address}
            </p>
         ),
      },
      {
         title: "Trạng thái",
         dataIndex: "status",
         key: "status",
         render: (_, user) => (
            <p
               className={
                  user.status
                     ? "font-semibold text-green-400"
                     : "font-semibold text-red-400"
               }
            >
               {user.status ? "Hoạt động" : "Không hoạt động"}
            </p>
         ),
      },
      {
         title: "Hành động",
         key: "action",
         dataIndex: "action",
         render: (_, user) => {
            // === 1. Xác định vai trò của USER (người trong hàng) ===

            const isUserOwner = user.arrRoles?.some(
               (role) => role.roleName === "ROLE_OWNER"
            );

            const isUserAdmin = user.arrRoles?.some(
               (role) => role.roleName === "ROLE_ADMIN"
            );
            // User thường: Có ROLE_USER và KHÔNG phải là Admin hoặc Owner
            const isUserStandard =
               user.arrRoles?.some((role) => role.roleName === "ROLE_USER") &&
               !isUserAdmin &&
               !isUserOwner;

            //  Xác định vai trò của NGƯỜI ĐĂNG NHẬP (bạn)

            const isLoggedOwner = accountLogged.roles?.some(
               (role) => role === "ROLE_OWNER"
            );

            // Định nghĩa các điều kiện hiển thị nút

            // Điều kiện hiển thị nút "Khóa" / "Xóa"
            const canLockOrDelete =
               // User thường (luôn có thể khóa)
               isUserStandard ||
               // Hoặc: Target là ADMIN và BẠN là OWNER (logic mới)
               (isUserAdmin && isLoggedOwner);

            // Điều kiện hiển thị nút "Sửa"
            const canEdit =
               // Target là user thường
               isUserStandard ||
               // Hoặc: Target là ADMIN và BẠN là OWNER (logic mới)
               (isUserAdmin && isLoggedOwner);

            // Render giao diện

            // Trường hợp đặc biệt: Bạn đang xem chính mình
            if (user.email === accountLogged.email) {
               return (
                  <div className="flex gap-2 items-center">
                     <button className="admin-account">
                        {isLoggedOwner ? "Chủ sở hữu" : "Quản trị viên"}
                     </button>
                     {/* Bạn luôn có thể sửa chính mình */}
                     <Button
                        onClick={() => handleShowUpdateModal(user)}
                        type="primary"
                        ghost
                     >
                        Sửa
                     </Button>
                  </div>
               );
            }

            // Trường hợp xem người dùng khác
            return (
               <div className="flex gap-2 items-center">
                  {/* NÚT KHÓA / XÓA*/}
                  {/* Hiển thị nếu target không phải Owner VÀ thỏa mãn điều kiện canLockOrDelete */}
                  {!isUserOwner && canLockOrDelete && (
                     <Button
                        onClick={() => handleShowModalDelete(user.id)}
                        type="primary"
                        danger
                        ghost
                        style={{
                           color: user.status ? "#efb748" : "",
                           borderColor: user.status ? "#efb748" : "",
                        }}
                     >
                        {user.status ? "Khóa" : "Xóa"}
                     </Button>
                  )}

                  {/* NÚT MỞ KHÓA*/}
                  {/* Hiển thị nếu target bị khóa VÀ không phải là Owner */}
                  {!user.status && !isUserOwner && (
                     <Button
                        onClick={() => handleShowUnblockStatus(user.id)}
                        color="cyan"
                        variant="solid"
                     >
                        Mở
                     </Button>
                  )}

                  {/* NÚT SỬA*/}
                  {/* Hiển thị nếu target không phải Owner VÀ thỏa mãn điều kiện canEdit */}
                  {!isUserOwner && canEdit && (
                     <Button
                        onClick={() => handleShowUpdateModal(user)}
                        type="primary"
                        ghost
                     >
                        Sửa
                     </Button>
                  )}
               </div>
            );
         },
      },
   ];

   const data = users?.map((user) => {
      return {
         id: user.id,
         key: user.id,
         fullName: user.fullName,
         email: user.email,
         gender: user.gender,
         phone: user.phone,
         address: user.address,
         status: user.status,
         roles: user.roles.map((role) => role.roleName).join(", "), // Chuyển đổi mảng roles thành chuỗi
         arrRoles: user.roles,
      };
   });

   // Tự động focus vào trường name
   useEffect(() => {
      if (fullNameRef.current) {
         fullNameRef.current.focus();
      }
   }, [isShowUpdateModal]);

   // Lấy dữ liệu người dùng
   // const fetchUsers = async () => {
   //    setIsLoading(true);
   //    const response = await getAllUsers(
   //       debounceSearch,
   //       currentPage,
   //       pageSize,
   //       checkStatusUser === "all" ? null : checkStatusUser,
   //       checkGenderUser === "all" ? null : checkGenderUser
   //    );
   //    setUsers(response.content);
   //    console.log(response.content);

   //    // Lấy ra tổng số bảng ghi
   //    setTotalElements(response.totalElements);

   //    setIsLoading(false);
   // };

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   // Lấy dữ liệu người dùng
   const fetchUsers = useCallback(async () => {
      setIsLoading(true);
      const pageIndex = currentPage - 1;

      const statusParam = checkStatusUser === "all" ? null : checkStatusUser;
      const genderParam = checkGenderUser === "all" ? null : checkGenderUser;

      const response = await getAllUsers(
         debounceSearch,
         pageIndex,
         pageSize,
         statusParam,
         genderParam
      );

      setUsers(response.content);
      setTotalElements(response.totalElements);

      setIsLoading(false);
   }, [
      debounceSearch,
      currentPage,
      pageSize,
      checkStatusUser,
      checkGenderUser,
   ]);

   // Lấy dữ liệu tất cả roleName
   const fetchRoleName = async () => {
      const response = await getAllRoleName();

      setRoleNames(response.data);
      console.log(response.data);
   };

   useEffect(() => {
      fetchUsers();
      fetchRoleName();
   }, []);

   // Tự động focus vào trường fullName
   useEffect(() => {
      if (fullNameRef.current) {
         fullNameRef.current.focus();
      }
   }, [isShowUpdateModal]);

   // Hàm mở modal cập nhật tài khoản
   const handleShowUpdateModal = (user) => {
      setIsShowUpdateModal(true);

      // Lấy id
      setBaseId(user.id);

      // Kiểm tra và xử lý giá trị roles
      const roles = Array.isArray(user.arrRoles)
         ? user.arrRoles.map((role) => role.roleName)
         : [];

      // Kiểm tra xem user đang cập nhật có phải là user đang đăng nhập không
      const isCurrentUser = accountLogged.email === user.email;
      setIsCurrentUser(isCurrentUser);

      // Tìm kiếm và fill giá trị user vào trong input form
      formUpdateUser.setFieldsValue({
         ...user,
         gender: user.gender,
         status: isCurrentUser ? true : user.status,
         roles: roles,
      });
   };

   // Hàm đóng modal cập nhật tài khoản
   const handleCloseUpdateModal = () => {
      setIsShowUpdateModal(false);

      // reset baseId
      setBaseId(null);
      formUpdateUser.resetFields();
   };

   // Hàm xử lý khi submit form cập nhật tài khoản
   const onFinishUpdateUser = async (values) => {
      try {
         setIsUpdateLoading(true);

         if (!baseId) return; // Đảm bảo baseId tồn tại

         // Lấy email của user đang được cập nhật
         const responseEmail = await findEmailById(baseId);
         const emailToUpdate = responseEmail.data;

         // Kiểm tra xem user đang được cập nhật có phải là user đang đăng nhập không
         const isCurrentUser = accountLogged.email === emailToUpdate;

         // Gọi API update trước (cho dù là current user hay user khác)
         const response = await updateUser(baseId, values);

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
                  status:
                     values.status !== undefined
                        ? values.status
                        : accountLogged.status,
                  roles: values.roles || accountLogged.roles,
               };
               localStorage.setItem(
                  "accountLogged",
                  JSON.stringify(updatedAccount)
               );
               // Kích hoạt sự kiện tùy chỉnh
               // Gửi tín hiệu thông báo kiểm tra ai có file nào nhận lắng nghe sự kiện không
               window.dispatchEvent(new Event("userUpdated"));
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

         // Load lại dữ liệu bảng
         fetchUsers();

         // Đóng modal
         handleCloseUpdateModal();

         // Reset form và baseId
         formUpdateUser.resetFields();
      } catch (error) {
         // Xử lý lỗi từ server (CustomException)
         if (error?.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi không xác định.");
         }
      } finally {
         setIsUpdateLoading(false);
      }
   };

   // Hàm mở modal xóa tài khoản
   const handleShowModalDelete = (id) => {
      setIsShowModalDelete(true);

      // Lấy id
      setBaseId(id);
   };

   // Hàm đóng modal xóa tai khoản
   const handleCloseModalDelete = () => {
      setIsShowModalDelete(false);

      // Reset lại baseId
      setBaseId(null);
   };

   // Hàm xác nhận khóa / xóa
   const handleConfirmDelete = async () => {
      try {
         setIsDeleteLoading(true);
         const response = await removeUser(baseId);

         if (response.status === 200) {
            // Hiện thông báo
            message.success("Xóa tài khoản thành công");
         } else {
            message.error("Xóa thất bại, vui lòng thử lại!");
         }
         setCurrentPage(1); // Quay về trang 1 sau khi xóa
      } catch (error) {
         if (error.status === HttpStatusCode.BadRequest) {
            message.warning(error?.response?.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsDeleteLoading(false);
         // Đóng modal delete
         handleCloseModalDelete();
         // Render lại danh sách tài khoản
         fetchUsers();
         // Reset lại baseId
         setBaseId(null);
      }
   };

   // Hàm mở khóa trạng thái
   const handleShowUnblockStatus = (id) => {
      setIsShowUnblockStatus(true);

      setBaseId(id);
   };

   // Hàm đóng mở khóa trạng thái
   const handleCloseUnblockStatus = () => {
      setIsShowUnblockStatus(false);

      setBaseId(null);
   };

   // Hàm xác nhận mở khóa tài khoản
   const handleConfirmUnblockStatus = async () => {
      try {
         setIsUnblockLoading(true);
         const response = await unblockStatus(baseId);
         if (response.status === 200) {
            message.success("Mở tài khoản thành công!");
         }
         // Load lại dữ liệu
         fetchUsers();

         // Tắt modal mở khóa
         handleCloseUnblockStatus();
      } catch (error) {
         if (error.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra sự cố. Vui lòng thử lại!");
         }
      } finally {
         setIsUnblockLoading(false);
      }
   };

   // Sẽ lấy dữ liêu từ sản phẩm khi search
   // useEffect(() => {
   //    fetchUsers();
   // }, [
   //    debounceSearch,
   //    currentPage,
   //    pageSize,
   //    checkStatusUser,
   //    checkGenderUser,
   // ]);

   // Theo dõi các bộ lọc và trang để tự động gọi API khi chúng thay đổi
   useEffect(() => {
      // Sẽ lấy dữ liệu người dùng khi các tham số lọc thay đổi
      fetchUsers();
   }, [fetchUsers]);

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   // lấy ra user hiện tại qua baseId
   const currentUser = users?.find((user) => user.id === baseId);
   const statusClass = currentUser
      ? currentUser.status
         ? "text-[#efb748]"
         : "text-red-400"
      : "text-gray-500"; // Mặc định nếu không tìm thấy user hoặc users rỗng

   // Kiểm tra vai trò của người đăng nhập có ROLE_OWNER không (Xử lý nút Update roles)
   const isLoggedOwner = accountLogged?.roles?.some(
      (role) => role === "ROLE_OWNER"
   );
   return (
      <>
         {/* Modal cập nhật tài khoản */}
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
                        required: true,
                        message: "Tên người dùng không bỏ trống!",
                     },
                  ]}
               >
                  <Input ref={fullNameRef} />
               </Form.Item>

               <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: "Email không bỏ trống!" }]}
               >
                  <Input placeholder="Nhập email" />
               </Form.Item>

               <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                     {
                        required: true,
                        message: "Số điện thoại không để trống",
                     },
                  ]}
               >
                  <Input />
               </Form.Item>
               <div className="flex justify-between">
                  <Form.Item
                     label="Giới tính"
                     name="gender"
                     rules={[
                        {
                           required: true,
                           message: "Giới tính không bỏ trống",
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
                     label="Vai trò"
                     name="roles"
                     rules={[
                        {
                           required: true,
                           message: "Vai trò không bỏ trống",
                        },
                     ]}
                  >
                     <Checkbox.Group className="flex flex-col">
                        {roleNames.map((role, index) => {
                           // Nếu người đăng nhập không phải OWNER thì không cho chọn ROLE_OWNER
                           const isDisabled =
                              role === "ROLE_OWNER" && !isLoggedOwner;
                           return (
                              <Checkbox
                                 disabled={isDisabled}
                                 key={index}
                                 value={role}
                              >
                                 {role}
                              </Checkbox>
                           );
                        })}
                     </Checkbox.Group>
                  </Form.Item>
               </div>
               <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[
                     {
                        required: true,
                        message: "Trạng thái bỏ trống",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn trạng thái"
                     style={{ width: 170 }}
                     options={
                        isCurrentUser
                           ? [{ value: true, label: "Hoạt động" }]
                           : [
                                { value: true, label: "Hoạt động" },
                                { value: false, label: "Không hoạt động" },
                             ]
                     }
                  />
               </Form.Item>
               <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[
                     {
                        required: true,
                        message: "Địa chỉ không bỏ trống",
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

         {/* Modal xóa tài khoản */}
         <Modal
            closeIcon={false}
            onCancel={handleCloseModalDelete}
            open={isShowModalDelete}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModalDelete} type="primary" ghost>
                     Hủy
                  </Button>
                  <Button
                     loading={isDeleteLoading}
                     onClick={handleConfirmDelete}
                     danger={!currentUser?.status}
                     type="primary" // Cho nút xóa full đỏ
                     style={{
                        backgroundColor: currentUser?.status
                           ? "#efb748"
                           : undefined,
                        color: currentUser?.status ? "#fff" : undefined, // Màu chữ cho nút "Khóa"
                        borderColor: currentUser?.status
                           ? "#efb748"
                           : undefined, // Màu viền cho nút "Khóa"
                     }}
                  >
                     {currentUser ? (currentUser.status ? "Khóa" : "Xóa") : ""}
                  </Button>
               </div>
            }
            title={
               <div className="flex items-center justify-between">
                  <div className="text-[20px] flex items-center gap-1">
                     <h3>Xác nhận</h3>
                     <p className={statusClass}>
                        {currentUser
                           ? currentUser.status
                              ? "khóa"
                              : "xóa"
                           : ""}
                     </p>
                     <p>tài khoản</p>
                  </div>
                  <CloseOutlined
                     onClick={handleCloseModalDelete}
                     className="cursor-pointer"
                  />
               </div>
            }
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắn chắn muốn</p>
               <p>{currentUser ? (currentUser.status ? "khóa" : "xóa") : ""}</p>
               <p className={`format ${statusClass}`}>
                  {currentUser?.fullName}
               </p>
               <p>này không?</p>
            </div>
         </Modal>

         {/* Modal mở khóa trạng thái tài khoản */}
         <Modal
            open={isShowUnblockStatus}
            onCancel={handleCloseUnblockStatus}
            footer={
               <div className="flex justify-end gap-2">
                  <Button
                     onClick={handleCloseUnblockStatus}
                     type="primary"
                     ghost
                  >
                     Hủy
                  </Button>
                  <Button
                     loading={isUnblockLoading}
                     onClick={handleConfirmUnblockStatus}
                     color="cyan"
                     variant="solid"
                  >
                     Mở
                  </Button>
               </div>
            }
            title={
               <div className="text-[20px]">
                  <h3>Xác nhận mở tài khoản</h3>
               </div>
            }
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắn chắn muốn mở tài khoản</p>
               <p className="format text-[#13c2c2]">{currentUser?.fullName}</p>
               <p>này không?</p>
            </div>
         </Modal>

         {/* Tiêu đề và nút thêm tài khoản */}
         <div className="flex items-center justify-between mb-5">
            <h3 className="text-[24px] font-semibold">Tài khoản</h3>
         </div>

         {/* Tìm kiếm tài khoản */}
         <div
            id="search-account"
            className="flex gap-5 items-center justify-start mb-3"
         >
            <div className="flex gap-2 items-center">
               <p>Trạng thái</p>
               <Select
                  defaultValue="all"
                  onChange={(value) => {
                     setCheckStatusUser(value); // Cập nhật trạng thái
                     setCurrentPage(1); // RESET VỀ TRANG 1
                  }} // Cập nhật thể loại
                  style={{ width: 160 }}
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },
                     {
                        value: true,
                        label: "Hoạt động",
                     },
                     {
                        value: false,
                        label: "Không hoạt động",
                     },
                  ]}
               />
            </div>
            <div className="flex gap-2 items-center">
               <p>Giới tính</p>
               <Select
                  defaultValue="all"
                  onChange={(value) => {
                     setCheckGenderUser(value); // Cập nhật giới tính
                     setCurrentPage(1); // RESET VỀ TRANG 1
                  }} // Cập nhật thể loại
                  style={{ width: 100 }}
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },
                     {
                        value: "MALE",
                        label: "Nam",
                     },
                     {
                        value: "FEMALE",
                        label: "Nữ",
                     },
                     {
                        value: "OTHER",
                        label: "Khác",
                     },
                  ]}
               />
            </div>
            <div>
               <Input.Search
                  loading={isLoading}
                  placeholder="Tìm kiếm tài khoản"
                  className="w-[350px]"
                  allowClear
                  value={searchValue}
                  onChange={(e) => {
                     setSearchValue(e.target.value);
                     if (searchValue != null) setCurrentPage(1);
                  }}
               />
            </div>
         </div>

         {/* Bảng dữ liệu của tài khoản */}
         <div className="mb-4">
            <Table
               pagination={false}
               columns={columns}
               dataSource={data}
               loading={isLoading}
            />
         </div>

         {/* Phân trang */}
         <div className="flex justify-end">
            {totalElements <= 5 ? (
               ""
            ) : (
               <div className="page">
                  <Pagination
                     showSizeChanger
                     total={totalElements}
                     showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`
                     }
                     onChange={handleChangePage}
                     defaultPageSize={pageSize}
                     current={currentPage}
                     pageSizeOptions={[5, 10, 20, 50, 100]}
                  />
               </div>
            )}
         </div>
      </>
   );
}
