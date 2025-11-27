import { useDebounce } from "@/hooks/useDebounce";
import { getAllUsersNotFilter } from "@/services/adminService";
import {
   cancelBooking,
   confirmBooking,
   createCustomer,
   getAllBookings,
   getAllBookingsNotFilter,
   getAllCustomers,
   removeCustomer,
   sendEmailConfirmOrCancelBooking,
   updateCustomer,
} from "@/services/BookingService";
import { formatMoney } from "@/utils/vaidate";
import {
   CheckCircleOutlined,
   CreditCardOutlined,
   DollarOutlined,
   ExclamationCircleOutlined,
   MinusCircleOutlined,
   PlusOutlined,
   QuestionOutlined,
   TagsOutlined,
} from "@ant-design/icons";
import {
   Button,
   Form,
   Input,
   InputNumber,
   message,
   Modal,
   Pagination,
   Select,
   Space,
   Table,
   Tag,
} from "antd";
import { HttpStatusCode } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function OrderManager() {
   const [baseId, setBaseId] = useState(null);
   const [isBookingLoading, setIsBookingLoading] = useState(false);
   const [bookings, setBookings] = useState([]);

   // Modal xác nhận đơn đặt
   const [isShowConfirmModal, setIsShowConfirmModal] = useState(false);
   const [isConfirmloading, setIsConfirmLoading] = useState(false);

   // Modal hủy bỏ đơn đặt
   const [isShowCancelModal, setIsShowCancelModal] = useState(false);
   const [isCancelLoading, setIsCancelLoading] = useState(false);

   // Phân trang
   const [users, setUsers] = useState([]);
   const [isUserLoading, setIsUserLoading] = useState(false);
   const [totalElements, setTotalElements] = useState(0);
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(8);
   const [checkStatus, setCheckStatus] = useState("all");
   const [checkUserId, setCheckUserId] = useState("all");

   // ==================================================================================================================================================
   // GIAO DIỆN XEM NGÀY
   // ==================================================================================================================================================

   // Modal xem ngày
   const [isShowDayDetailModal, setIsShowDayDetailModal] = useState(false);
   const [isDayDetailLoading, setIsDayDetailLoading] = useState(false);

   // ==================================================================================================================================================
   // GIAO DIỆN XEM KHÁCH HÀNG
   // ==================================================================================================================================================

   const [customers, setCustomers] = useState([]);
   const [isShowCustomerModal, setIsShowCustomerModal] = useState(false);
   const [isCustomerLoading, setIsCustomerLoading] = useState(false);

   // Phân trang cho khách hàng
   const [customertotalElements, setCustomerTotalElements] = useState(0);
   const [customercurrentPage, setCustomerCurrentPage] = useState(0);
   const [customerpageSize, setCustomerPageSize] = useState(8);
   const [customerSearchValue, setCustomerSearchValue] = useState("");

   // Thêm khách hàng
   const customerNameRef = useRef();
   const [isShowAddCustomerModal, setIsShowAddCustomerModal] = useState(false);
   const [isAddCustomerLoading, setIsAddCustomerLoading] = useState(false);
   const [formAddCustomer] = Form.useForm();

   // Lấy id của khách hàng
   const [customerBaseId, setCustomerBaseId] = useState(null);

   // Xóa khách hàng
   const [isShowDeleteCustomerModal, setIsShowDeleteCustomerModal] =
      useState(false);
   const [isDeleteCustomerLoading, setIsDeleteCustomerLoading] =
      useState(false);

   // Cập nhật khách hàng
   const [formUpdateCustomer] = Form.useForm();
   const [isShowUpdateCustomerModal, setIsShowUpdateCustomerModal] =
      useState(false);
   const [isUpdateCustomerLoading, setIsUpdateCustomerLoading] =
      useState(false);

   // ==================================================================================================================================================
   const columns = [
      {
         title: "Tên người đặt",
         dataIndex: "fullName",
         key: "fullName",
         render: (_, booking) => (
            <p title={booking.fullName} className="format">
               {booking.fullName}
            </p>
         ),
      },
      {
         title: "Email",
         dataIndex: "email",
         key: "email",
         render: (_, booking) => (
            <p title={booking.email} className="format">
               {booking.email}
            </p>
         ),
      },
      {
         title: "Số diện thoại",
         dataIndex: "phone",
         key: "phone",
         render: (_, booking) => (
            <p
               title={booking.phone === null ? "Chưa có" : booking.phone}
               className={
                  booking.phone === null
                     ? "format font-semibold text-red-500"
                     : "format"
               }
            >
               {booking.phone === null ? "Chưa có" : booking.phone}
            </p>
         ),
      },
      {
         title: "Giới tính",
         dataIndex: "gender",
         key: "gender",
         render: (_, booking) => {
            const genderText =
               booking.gender === "MALE"
                  ? "Nam"
                  : booking.gender === "FEMALE"
                  ? "Nữ"
                  : booking.gender === "OTHER"
                  ? "Khác"
                  : "Chưa có";
            const genderClass =
               booking.gender === "MALE"
                  ? "text-blue-500"
                  : booking.gender === "FEMALE"
                  ? "text-pink-500"
                  : booking.gender === "OTHER"
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
         title: "Số lượng khách",
         key: "customers",
         render: (_, booking) => (
            <Button
               onClick={() => handleShowCustomerModal(booking)}
               size="large"
               type="default"
               style={{
                  color: "#fff", // Màu chữ
                  borderColor: "#faad14", // Màu viền
                  backgroundColor: "#faad14", // Màu nền
               }}
            >
               Xem khách
            </Button>
         ),
      },
      {
         title: "Ngày đặt",
         key: "dayDetail",

         render: (_, booking) => (
            <Button
               onClick={() => handleShowDayDetailModal(booking)}
               color="purple"
               variant="solid"
               size="large"
            >
               Xem ngày
            </Button>
         ),
      },
      {
         title: "Trạng thái",
         key: "status",
         render: (_, booking) => (
            <p
               className={
                  booking.status === "PENDING"
                     ? "font-semibold text-red-400"
                     : booking.status === "CONFIRMED"
                     ? "font-semibold text-yellow-400"
                     : booking.status === "WAITING_FOR_PAYMENT"
                     ? "font-semibold text-blue-400"
                     : booking.status === "PAID"
                     ? "font-semibold text-[#08979c]"
                     : "font-semibold text-gray-400"
               }
            >
               {booking.status === "PENDING"
                  ? "Đang chờ xử lý"
                  : booking.status === "CONFIRMED"
                  ? "Đã xác nhận"
                  : booking.status === "WAITING_FOR_PAYMENT"
                  ? "Chờ thanh toán"
                  : booking.status === "PAID"
                  ? "Đã thanh toán"
                  : "Đã hủy  "}
            </p>
         ),
      },
      {
         title: "Hành động",
         key: "action",
         render: (_, booking) => {
            // Trạng thái PENDING (Chờ xử lý)
            if (booking.status === "PENDING") {
               return (
                  <Space size="middle">
                     {/* Nút Hủy (CANCEL) */}
                     <Button
                        type="default"
                        danger // Sử dụng thuộc tính 'danger' của Ant Design cho màu đỏ
                        size="large"
                        onClick={() => handleShowCancelModal(booking)}
                     >
                        Hủy bỏ
                     </Button>

                     {/* Nút Xác nhận (CONFIRM) */}
                     <Button
                        type="primary"
                        ghost
                        size="large"
                        onClick={() => handleShowConfirmModal(booking)}
                     >
                        Xác nhận
                     </Button>
                  </Space>
               );
            }

            // Trạng thái CONFIRMED (Đã xác nhận)
            if (booking.status === "CONFIRMED") {
               return (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                     Đã xác nhận
                  </Tag>
               );
            }

            // Trạng thái WAITING_FOR_PAYMENT (Chờ thanh toán)
            if (booking.status === "WAITING_FOR_PAYMENT") {
               return (
                  <Tag icon={<CreditCardOutlined />} color="blue">
                     Chờ thanh toán
                  </Tag>
               );
            }

            // Trạng thái PAID (Đã thanh toán)
            if (booking.status === "PAID") {
               return (
                  <Tag icon={<DollarOutlined />} color="cyan">
                     Đã thanh toán
                  </Tag>
               );
            }

            // Trạng thái CANCELED (Đã hủy)
            if (booking.status === "CANCELED") {
               return (
                  <Tag icon={<ExclamationCircleOutlined />} color="default">
                     Đã hủy
                  </Tag>
               );
            }

            // Các trạng thái khác (Đã hoàn thành, v.v.)
            return (
               <Tag icon={<QuestionOutlined />} color="default">
                  Không có hành động
               </Tag>
            );
         },
      },
   ];
   const data = bookings?.map((booking, index) => {
      return {
         id: booking.id,
         key: booking.id,
         fullName: booking.user.fullName,
         email: booking.user.email,
         phone: booking.user.phone,
         gender: booking.user.gender,
         status: booking.status,
         dayDetail: booking.dayDetail,
         customers: booking.customers,
      };
   });

   // Hàm để lấy dữ liệu đơn đặt từ API
   const fetchBooking = useCallback(async () => {
      setIsBookingLoading(true);
      const pageIndex = currentPage - 1;

      const statusParam = checkStatus === "all" ? null : checkStatus;
      const userIdParam = checkUserId === "all" ? null : checkUserId;

      const response = await getAllBookings(
         pageIndex,
         pageSize,
         statusParam,
         userIdParam
      );

      setBookings(response.content);
      setTotalElements(response.totalElements);
      setIsBookingLoading(false);
   }, [currentPage, pageSize, checkStatus, checkUserId]);

   // Hàm để lấy dữ liệu người đặt từ API
   const fetchUser = async () => {
      setIsUserLoading(true);
      const response = await getAllUsersNotFilter();
      setUsers(response.data);
      setIsUserLoading(false);
   };

   // Gọi hàm fetchBooking, fetchUser khi component được mount lần đầu tiên
   useEffect(() => {
      fetchBooking();
      fetchUser();
   }, []);

   // Hàm để hiển thị modal xác nhận đơn đặt
   const handleShowConfirmModal = (booking) => {
      setIsShowConfirmModal(true);
      setBaseId(booking.id);
   };

   // Ẩn modal xác nhận đơn đặt
   const handleCloseConfirmModal = () => {
      setIsShowConfirmModal(false);

      setBaseId(null);
   };

   // Lấy đơn đặt xác nhận hiện tại
   const currentConfirmBooking = bookings?.find(
      (booking) => booking.id === baseId
   );

   // Hàm để xác nhận đơn đặt
   const handleConfirmBooking = async () => {
      setIsConfirmLoading(true);
      try {
         const sendEmailResponse = await sendEmailConfirmOrCancelBooking(
            currentConfirmBooking?.user?.email,
            "CONFIRMED",
            currentConfirmBooking
         );

         if (sendEmailResponse) {
            message.success("Đã gửi Email xác nhận về địa chỉ email người đặt");
         } else {
            message.error("Gửi Email xác nhận thất bại. Vui lòng thử lại sau!");
            return;
         }
         const response = await confirmBooking(baseId);

         if (response.status === 200) {
            message.success("Xác nhận đơn đặt thành công");
         } else {
            message.error("Xác nhận đơn đặt thất bại");
            return;
         }

         // Cập nhật lại danh sách đơn đặt sau khi xác nhận thành công
         fetchBooking();
         handleCloseConfirmModal();
      } catch (error) {
         console.log(error);
         if (error?.response?.status === HttpStatusCode.BadRequest) {
            message.error(error?.response?.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsConfirmLoading(false);
      }
   };

   // Hàm để hiển thị modal hủy bỏ đơn đặt
   const handleShowCancelModal = (booking) => {
      setIsShowCancelModal(true);
      setBaseId(booking.id);
   };

   // Ẩn modal hủy bỏ đơn đặt
   const handleCloseCancelModal = () => {
      setIsShowCancelModal(false);
      setBaseId(null);
   };

   // Lấy đơn đặt hủy bỏ hiện tại
   const currentCancelBooking = bookings?.find(
      (booking) => booking.id === baseId
   );

   // Hàm hủy bỏ đơn đặt
   const handleCancelBooking = async () => {
      setIsCancelLoading(true);
      try {
         const sendEmailResponse = await sendEmailConfirmOrCancelBooking(
            currentCancelBooking?.user?.email,
            "CANCELED",
            currentCancelBooking
         );

         if (sendEmailResponse) {
            message.success("Đã gửi Email hủy bỏ về địa chỉ email người đặt");
         } else {
            message.error("Gửi Email hủy bỏ thất bại. Vui lòng thử lại sau!");
            return;
         }

         const response = await cancelBooking(baseId);

         if (response.status === 200) {
            message.success("hủy bỏ đơn đặt thành công");
         } else {
            message.error("hủy bỏ đơn đặt thất bại");
            return;
         }
         // Cập nhật lại danh sách đơn đặt sau khi xác nhận thành công
         fetchBooking();
         handleCloseCancelModal();
      } catch (error) {
         message.error("error: ", error);
         if (error.response.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsCancelLoading(false);
      }
   };

   // Theo dõi các bộ lọc và trang để tự động gọi API khi chúng thay đổi
   useEffect(() => {
      // Sẽ lấy dữ liệu người dùng khi các tham số lọc thay đổi
      fetchBooking();
   }, [fetchBooking]);

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   // ========================================================================================================================================
   // GIAO DIỆN XEM NGÀY
   // ========================================================================================================================================

   // Hàm hiển thị modal xem ngày của đơn đặt
   const handleShowDayDetailModal = (booking) => {
      setIsShowDayDetailModal(true);
      setBaseId(booking.id);
   };

   // Hàm ẩn modal xem ngày của đơn đặt
   const handleCloseDayDetailModal = () => {
      setIsShowDayDetailModal(false);
      setBaseId(null);
   };

   // Lấy ngàyhiện tại của booking muốn xem
   const currentDayDetailBooking = bookings?.find(
      (booking) => booking.id === baseId
   );

   const columnsDayDetail = [
      {
         title: "Tên chuyến đi",
         dataIndex: "tourName",
         key: "tourName",
         render: (_, detail) => (
            <p title={detail.tourName} className="format">
               {detail.tourName}
            </p>
         ),
      },
      {
         title: "Khu vực",
         dataIndex: "areaName",
         key: "areaName",
         render: (_, detail) => (
            <p title={detail.areaName} className="format text-[#eb2f96]">
               {detail.areaName}
            </p>
         ),
      },
      {
         title: "Ngày khởi hành",
         dataIndex: "departureDate",
         key: "departureDate",
         render: (_, detail) => (
            <p
               title={detail.departureDate}
               className="font-semibold text-blue-500"
            >
               {detail.departureDate}
            </p>
         ),
      },
      {
         title: "Ngày trở về",
         dataIndex: "returnDate",
         key: "returnDate",
         render: (_, detail) => (
            <p
               title={detail.returnDate}
               className="font-semibold text-amber-500"
            >
               {detail.returnDate}
            </p>
         ),
      },
      {
         title: "Số chỗ",
         dataIndex: "slot",
         key: "slot",
         render: (_, detail) => (
            <Tag
               className="text-[15px]!"
               icon={<TagsOutlined />}
               color="volcano"
            >
               {detail.slot}
            </Tag>
         ),
      },
      {
         title: "Tổng tiền",
         dataIndex: "price",
         key: "price",
         render: (_, detail) => (
            <p title={detail.price} className="text-green-500 format">
               {formatMoney(detail.price)}
            </p>
         ),
      },
      {
         title: "Mô tả",
         dataIndex: "description",
         key: "description",
         render: (_, detail) => (
            <p title={detail.description} className="format text-[#1677ff]">
               {detail.description}
            </p>
         ),
      },
   ];

   // Lấy tổng số khách hàng
   const customerCount = currentDayDetailBooking?.customers
      ? currentDayDetailBooking?.customers?.length
      : 0;

   // Giá tiền gốc
   const basePrice = currentDayDetailBooking?.dayDetail?.price || 0;

   // Tổng tiền = khách hàng x tiền
   const totalPrice = customerCount * basePrice;

   // Dữ liệu truyền vào table
   const dataDayDetail = [
      {
         id: currentDayDetailBooking?.id,
         key: currentDayDetailBooking?.id,
         tourName: currentDayDetailBooking?.dayDetail?.tour?.tourName,
         areaName: currentDayDetailBooking?.dayDetail?.tour?.area?.areaName,
         departureDate: currentDayDetailBooking?.dayDetail?.departureDate,
         returnDate: currentDayDetailBooking?.dayDetail?.returnDate,
         slot: customerCount,
         price: totalPrice,
         description: currentDayDetailBooking?.dayDetail?.tour?.description,
      },
   ];

   // ==================================================================================================================================================
   // GIAO DIỆN XEM KHÁCH HÀNG
   // ==================================================================================================================================================

   // Hàm hiển thị thông tin khách hàng
   const handleShowCustomerModal = (booking) => {
      setIsShowCustomerModal(true);
      setBaseId(booking.id);
   };

   // Hàm ẩn thông tin khách hàng
   const handleCloseCustomerModal = () => {
      setIsShowCustomerModal(false);
      setBaseId(null);
   };

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceCustomerSearch = useDebounce(customerSearchValue, 800);

   // Lấy toàn bộ khách hàng theo bookingId
   const fetchCustomers = useCallback(async () => {
      setIsCustomerLoading(true);
      const pageIndex = customercurrentPage - 1;
      if (baseId === null) return;
      const response = await getAllCustomers(
         pageIndex,
         customerpageSize,
         debounceCustomerSearch,
         baseId
      );
      setCustomers(response.data.content);
      setCustomerTotalElements(response.data.totalElements);
      setIsCustomerLoading(false);
   }, [customercurrentPage, customerpageSize, debounceCustomerSearch, baseId]);

   const columnsCusotmer = [
      {
         title: "Tên khách hàng",
         dataIndex: "customerName",
         key: "customerName",
         render: (_, customer) => (
            <p
               className="text-blue-400 format font-semibold"
               title={customer?.customerName}
            >
               {customer?.customerName}
            </p>
         ),
      },
      {
         title: "Tuổi",
         dataIndex: "age",
         key: "age",
         render: (_, customer) => (
            <p
               className="text-amber-400 format font-semibold"
               title={customer?.age}
            >
               {customer?.age}
            </p>
         ),
      },
      {
         title: "Số điện thoại",
         dataIndex: "phone",
         key: "phone",
         render: (_, customer) => (
            <p
               title={
                  customer.phone === null ||
                  customer.phone === "" ||
                  customer.phone === undefined
                     ? "Chưa có"
                     : customer.phone
               }
               className={
                  customer.phone === null ||
                  customer.phone === "" ||
                  customer.phone === undefined
                     ? "format font-semibold text-red-500"
                     : "format text-gray-500"
               }
            >
               {customer.phone === null ||
               customer.phone === "" ||
               customer.phone === undefined
                  ? "Chưa có"
                  : customer.phone}
            </p>
         ),
      },
      {
         title: "Giới tính",
         dataIndex: "gender",
         key: "gender",
         render: (_, customer) => {
            const genderText =
               customer.gender === "MALE"
                  ? "Nam"
                  : customer.gender === "FEMALE"
                  ? "Nữ"
                  : customer.gender === "OTHER"
                  ? "Khác"
                  : "Chưa có";
            const genderClass =
               customer.gender === "MALE"
                  ? "text-blue-500"
                  : customer.gender === "FEMALE"
                  ? "text-pink-500"
                  : customer.gender === "OTHER"
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
         title: "Hành động",
         key: "action",
         render: (_, customer) => (
            <div className="flex items-center gap-2">
               <Button
                  onClick={() => handleShowDeleteCustomerModal(customer)}
                  size="large"
                  danger
                  ghost
               >
                  Xóa
               </Button>
               <Button
                  onClick={() => handleShowUpdateCustomerModal(customer)}
                  size="large"
                  type="primary"
                  ghost
               >
                  Sửa
               </Button>
            </div>
         ),
      },
   ];
   const dataCusotmer = customers?.map((customer) => {
      return {
         id: customer.id,
         key: customer.id,
         customerName: customer.customerName,
         gender: customer.gender,
         phone: customer.phone,
         age: customer.age,
      };
   });

   // Hàm hiển thị modal thêm customer
   const handleShowAddCustomerModal = () => {
      setIsShowAddCustomerModal(true);
   };

   // Hàm ẩn modal thêm customer
   const handleCloseAddCustomerModal = () => {
      setIsShowAddCustomerModal(false);
      formAddCustomer.resetFields();
   };

   // Hàm xác nhận thêm customer
   const onFinishAddCustomer = async (value) => {
      console.log(value);

      setIsAddCustomerLoading(true);
      try {
         const response = await createCustomer(value, baseId);
         console.log(response);

         if (response.status === 200) {
            message.success("Thêm khách hàng thành công!");
         } else {
            message.error("Thêm khách hàng thất bại, vui lòng thử lại!");
            return;
         }
         fetchCustomers();
         handleCloseAddCustomerModal();
      } catch (error) {
         console.log(error);

         if (error.response.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
      } finally {
         setIsAddCustomerLoading(false);
      }
   };

   // Hàm hiển thị modal xóa khách hàng
   const handleShowDeleteCustomerModal = (customer) => {
      setIsShowDeleteCustomerModal(true);
      setCustomerBaseId(customer.id);
   };

   // Hàm ẩn modal xóa khách hàng
   const handleCloseDeleteCustomerModal = () => {
      setIsShowDeleteCustomerModal(false);
      setCustomerBaseId(null);
   };

   // Lấy id khách hàng xóa hiện tại
   const currentDeleteCustomerById = customers?.find(
      (customer) => customer.id === customerBaseId
   );

   // Hàm xác nhận xóa khách hàng
   const handleConfirmDeleteCustomer = async () => {
      setIsDeleteCustomerLoading(true);
      try {
         const response = await removeCustomer(baseId, customerBaseId);
         console.log(response);

         if (response.status === 200) {
            // Hiện thông báo
            message.success("Xóa khách hàng thành công");
         } else {
            message.error("Xóa thất bại, vui lòng thử lại!");
         }
         setCustomerCurrentPage(1);
      } catch (error) {
         if (error.status === HttpStatusCode.BadRequest) {
            message.warning(error?.response?.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsDeleteCustomerLoading(false);
         fetchCustomers();
         handleCloseDeleteCustomerModal();
      }
   };

   // Hàm hiển thị cập nhật khách hàng
   const handleShowUpdateCustomerModal = (customer) => {
      setIsShowUpdateCustomerModal(true);
      setCustomerBaseId(customer.id);
      formUpdateCustomer.setFieldsValue({
         customerName: customer.customerName,
         age: customer.age,
         gender: customer.gender,
         phone: customer.phone,
      });
   };

   // Hàm ẩn cập nhật khách hàng
   const handleCloseUpdateCustomerModal = () => {
      setIsShowUpdateCustomerModal(false);
      setCustomerBaseId(null);
      formUpdateCustomer.resetFields();
   };

   const currentUpdateCustomer = customers?.find(
      (customer) => customer.id === baseId
   );

   // Hàm xác nhận cập nhật khách hàng
   const onFinishUpdateCustomer = async (value) => {
      console.log("value, ", value);

      setIsUpdateCustomerLoading(true);
      try {
         const response = await updateCustomer(baseId, customerBaseId, value);
         console.log(response);

         if (response.status === 200) {
            message.success("Cập nhật khách hàng thành công!");
         } else {
            message.error("Cập nhật khách hàng thất bại, vui lòng thử lại!");
            return;
         }
         fetchCustomers();
         handleCloseUpdateCustomerModal();
      } catch (error) {
         console.log(error);

         if (error.response.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
      } finally {
         setIsUpdateCustomerLoading(false);
      }
   };

   // Theo dõi các bộ lọc và trang để tự động gọi API khi chúng thay đổi
   useEffect(() => {
      // Sẽ lấy dữ liệu người dùng khi các tham số lọc thay đổi
      fetchCustomers();
   }, [fetchCustomers]);

   // Hàm chuyển trang
   const handleCustomerChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCustomerCurrentPage(currentPage);

      // cập nhật số lượng bảng ghi / trang
      setCustomerPageSize(pageSize);
   };

   // Lấy thông tin đơn đặt hiện tại dựa trên baseId
   const currentBooking = bookings?.find((booking) => booking.id === baseId);
   return (
      <>
         {/* Giao diện cập nhật khách hàng */}
         <Modal
            open={isShowUpdateCustomerModal}
            onCancel={handleCloseUpdateCustomerModal}
            footer={false}
            title={
               <div className="flex items-center gap-1">
                  <h3>Cập nhật khách hàng</h3>
                  <h3 className="format text-blue-500 font-semibold">
                     {currentUpdateCustomer?.customerName}
                  </h3>
               </div>
            }
         >
            <Form
               form={formUpdateCustomer}
               name="update-customers"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinishUpdateCustomer}
               autoComplete="off"
               requiredMark={false}
            >
               {/* 1. Tên khách hàng */}
               <Form.Item
                  name="customerName"
                  label="Tên khách hàng"
                  rules={[
                     {
                        required: true,
                        message: "Tên khách hàng không để trống",
                     },
                     {
                        pattern:
                           /^[a-zA-ZÀÁẠÃẢẶẴẲẮẰÁĂÂẤẪẨẬẦÃÈẼẺẸÉÊẾỀỄỆỂÌÍỈỊIỢỠỚỜỞÕỌỎÒÓỔỖỐỒỘÔÕƯỨỪỰỮỬỤŨỦÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÊƠàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũơớờợởỡăắằặẳẵâấầậẩẫêếềệểễđĩọỏốồộổỗồờớợởẽẹẻếìíùúụũưữựửữữýỳỵỷỹ ]+$/,
                        message: "Tên chỉ được chứa chữ",
                     },
                  ]}
               >
                  <Input ref={customerNameRef} placeholder="Tên khách hàng" />
               </Form.Item>

               <div className="flex items-center gap-10">
                  {/* Tuổi */}
                  <Form.Item
                     name="age"
                     label="Số tuổi"
                     rules={[
                        {
                           required: true,
                           message: "Số tuổi không để trống",
                        },
                        {
                           validator: (_, value) => {
                              // Kiểm tra nếu giá trị tồn tại và nhỏ hơn hoặc bằng 0
                              if (value && value <= 0) {
                                 return Promise.reject(
                                    new Error(
                                       "Số tuổi phải lớn hơn hoặc bằng 1!"
                                    )
                                 );
                              }
                              // Nếu giá trị rỗng, quy tắc required đã xử lý
                              return Promise.resolve();
                           },
                        },
                     ]}
                  >
                     <InputNumber min={1} max={200} />
                  </Form.Item>

                  {/* Giới tính */}
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
               </div>

               {/* 4. Số điện thoại */}
               <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                     {
                        pattern: /^(0|\+84)(9|3|7|8|5)\d{8}$/,
                        message:
                           "Số điện thoại không hợp lệ (Phải là 10 số bắt đầu bằng 0)",
                     },
                  ]}
               >
                  <Input placeholder="Nhập số điện thoại (Không bắt buộc)" />
               </Form.Item>

               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseUpdateCustomerModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isUpdateCustomerLoading}
                        color="primary"
                        variant="outlined"
                        size="large"
                        htmlType="submit"
                     >
                        {"Cập nhật"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện xóa khách hàng */}
         <Modal
            onCancel={handleCloseDeleteCustomerModal}
            title={
               <div className="flex items-center gap-1">
                  <h3>Xóa khách hàng:</h3>
                  <h3 className="format font-semibold text-red-400">
                     {currentDeleteCustomerById?.customerName}
                  </h3>
               </div>
            }
            footer={
               <div className="flex items-center justify-end gap-2">
                  <Button
                     onClick={handleCloseDeleteCustomerModal}
                     size="large"
                     type="primary"
                     ghost
                  >
                     Hủy
                  </Button>
                  <Button
                     loading={isDeleteCustomerLoading}
                     onClick={handleConfirmDeleteCustomer}
                     size="large"
                     danger
                  >
                     Xóa
                  </Button>
               </div>
            }
            open={isShowDeleteCustomerModal}
         >
            {
               <div className="flex items-center gap-1">
                  <p>Bạn có chắc muốn xóa khách hàng:</p>
                  <p className="text-red-400 format">
                     {currentDeleteCustomerById?.customerName}
                  </p>
               </div>
            }
         </Modal>

         {/* Giao diện thêm khách hàng */}
         <Modal
            onCancel={handleCloseAddCustomerModal}
            title="Thêm khách hàng"
            footer={false}
            open={isShowAddCustomerModal}
         >
            <Form
               form={formAddCustomer}
               name="add-customers"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinishAddCustomer}
               autoComplete="off"
               requiredMark={false}
            >
               {/* khách hàng */}
               <Form.List
                  name="customers"
                  // Mảng customers không được rỗng (ít nhất 1 mục)
                  rules={[
                     {
                        validator: async (_, customers) => {
                           if (!customers || customers.length === 0) {
                              return message.error(
                                 "Vui lòng thêm ít nhất một khách hàng!"
                              );
                           }
                           return Promise.resolve();
                        },
                     },
                  ]}
               >
                  {(fields, { add, remove }) => (
                     <>
                        {/* Lặp qua các trường hiện có */}
                        {fields.map(({ key, name, ...restField }) => (
                           <Space
                              key={key}
                              style={{
                                 display: "flex",
                                 marginBottom: 8,
                                 border: "1px solid #ccc",
                                 padding: "10px",
                                 borderRadius: "4px",
                              }}
                              align="start"
                              direction="vertical" // Dùng vertical để các trường xếp dọc
                           >
                              <h3>Khách hàng #{name + 1}</h3>

                              {/* 1. Tên khách hàng */}
                              <Form.Item
                                 {...restField}
                                 name={[name, "customerName"]}
                                 label="Tên khách hàng"
                                 rules={[
                                    {
                                       required: true,
                                       message: "Tên khách hàng không để trống",
                                    },
                                    {
                                       pattern:
                                          /^[a-zA-ZÀÁẠÃẢẶẴẲẮẰÁĂÂẤẪẨẬẦÃÈẼẺẸÉÊẾỀỄỆỂÌÍỈỊIỢỠỚỜỞÕỌỎÒÓỔỖỐỒỘÔÕƯỨỪỰỮỬỤŨỦÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÊƠàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũơớờợởỡăắằặẳẵâấầậẩẫêếềệểễđĩọỏốồộổỗồờớợởẽẹẻếìíùúụũưữựửữữýỳỵỷỹ ]+$/,
                                       message: "Tên chỉ được chứa chữ",
                                    },
                                 ]}
                              >
                                 <Input
                                    ref={customerNameRef}
                                    placeholder="Tên khách hàng"
                                 />
                              </Form.Item>

                              <div className="flex items-center gap-10">
                                 {/* Tuổi */}
                                 <Form.Item
                                    name={[name, "age"]}
                                    label="Số tuổi"
                                    rules={[
                                       {
                                          required: true,
                                          message: "Số tuổi không để trống",
                                       },
                                       {
                                          validator: (_, value) => {
                                             // Kiểm tra nếu giá trị tồn tại và nhỏ hơn hoặc bằng 0
                                             if (value && value <= 0) {
                                                return Promise.reject(
                                                   new Error(
                                                      "Số tuổi phải lớn hơn hoặc bằng 1!"
                                                   )
                                                );
                                             }
                                             // Nếu giá trị rỗng, quy tắc required đã xử lý
                                             return Promise.resolve();
                                          },
                                       },
                                    ]}
                                 >
                                    <InputNumber min={1} max={200} />
                                 </Form.Item>

                                 {/* Giới tính */}
                                 <Form.Item
                                    label="Giới tính"
                                    name={[name, "gender"]}
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
                              </div>

                              {/* 4. Số điện thoại */}
                              <Form.Item
                                 name={[name, "phone"]}
                                 label="Số điện thoại"
                                 rules={[
                                    {
                                       pattern: /^(0|\+84)(9|3|7|8|5)\d{8}$/,
                                       message:
                                          "Số điện thoại không hợp lệ (Phải là 10 số bắt đầu bằng 0)",
                                    },
                                 ]}
                              >
                                 <Input placeholder="Nhập số điện thoại (Không bắt buộc)" />
                              </Form.Item>

                              {/* Nút xóa item */}
                              <MinusCircleOutlined
                                 onClick={() => {
                                    remove(name);
                                 }}
                                 style={{
                                    alignSelf: "flex-end",
                                    fontSize: "18px",
                                 }}
                              />
                           </Space>
                        ))}

                        {/* Nút thêm item */}
                        <Form.Item>
                           <Button
                              type="dashed"
                              onClick={() => {
                                 add();
                                 setTimeout(() => {
                                    if (customerNameRef.current) {
                                       customerNameRef.current.focus();
                                    }
                                 }, 100);
                              }}
                              block
                              icon={<PlusOutlined />}
                           >
                              Thêm Chi tiết khách hàng
                           </Button>
                        </Form.Item>
                     </>
                  )}
               </Form.List>

               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseCustomerModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isAddCustomerLoading}
                        color="primary"
                        variant="outlined"
                        size="large"
                        htmlType="submit"
                     >
                        {"Thêm"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện xem khách hàng */}
         <Modal
            onCancel={handleCloseCustomerModal}
            width={1500}
            title={
               <div className="flex items-center gap-1">
                  <h3>Thông tin khách hàng trong chuyến đi</h3>
                  <h3>
                     <span className="text-amber-400">
                        {currentBooking?.dayDetail?.tour?.tourName}
                     </span>
                     , người đặt là
                  </h3>
                  <h3 className="text-amber-600">
                     {currentBooking?.user?.fullName}
                  </h3>
               </div>
            }
            open={isShowCustomerModal}
            footer={false}
         >
            {/* Giao diện thêm khách hàng */}
            <div className="flex items-center justify-between">
               <div id="search-order">
                  <Input.Search
                     loading={isCustomerLoading}
                     placeholder="Tìm kiếm khách hàng"
                     className="w-[350px]"
                     allowClear
                     value={customerSearchValue}
                     onChange={(e) => {
                        setCustomerSearchValue(e.target.value);
                        if (customerSearchValue != null)
                           setCustomerCurrentPage(1);
                     }}
                  />
               </div>
               <Button
                  onClick={handleShowAddCustomerModal}
                  size="large"
                  type="primary"
               >
                  Thêm khách hàng
               </Button>
            </div>

            {/* Giao diện bảng dữ liệu khách hàng */}
            <div>
               <Table
                  loading={isCustomerLoading}
                  columns={columnsCusotmer}
                  dataSource={dataCusotmer}
                  pagination={false}
               />
            </div>

            {/* Giao diện phân trang */}
            <div className="flex justify-end">
               {customertotalElements <= 8 ? (
                  ""
               ) : (
                  <div className="page">
                     <Pagination
                        showSizeChanger
                        total={customertotalElements}
                        showTotal={(total, range) =>
                           `${range[0]}-${range[1]} of ${total} items`
                        }
                        onChange={handleCustomerChangePage}
                        defaultPageSize={customerpageSize}
                        current={customercurrentPage}
                        pageSizeOptions={[8, 16, 32, 50, 100]}
                     />
                  </div>
               )}
            </div>
         </Modal>

         {/* Giao diện xem ngày */}
         <Modal
            onCancel={handleCloseDayDetailModal}
            footer={false}
            width={1500}
            title={`Ngày đặt của ${currentBooking?.user?.fullName}`}
            open={isShowDayDetailModal}
         >
            <Table
               pagination={false}
               columns={columnsDayDetail}
               dataSource={dataDayDetail}
            />
         </Modal>

         {/* Giao diện hủy bỏ đơn đặt */}
         <Modal
            title={
               <div className="flex items-center gap-1">
                  <h3>Hủy bỏ đơn đặt của</h3>
                  <h3
                     title={currentBooking?.user?.fullName}
                     className="text-[20px] text-red-500 format"
                  >
                     {currentBooking?.user?.fullName}
                  </h3>
               </div>
            }
            onCancel={handleCloseCancelModal}
            footer={
               <div className="flex items-center justify-end gap-2">
                  <Button
                     type="primary"
                     ghost
                     size="large"
                     onClick={handleCloseCancelModal}
                  >
                     Tắt
                  </Button>
                  <Button
                     loading={isCancelLoading}
                     size="large"
                     danger
                     type="primary"
                     onClick={() => handleCancelBooking()}
                  >
                     Hủy bỏ
                  </Button>
               </div>
            }
            open={isShowCancelModal}
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắc chắn hủy bỏ chuyến du lịch ở</p>
               <p
                  title={currentBooking?.dayDetail?.tour?.tourName}
                  className="format font-semibold text-red-500"
               >
                  {currentBooking?.dayDetail?.tour?.tourName}
               </p>
            </div>
         </Modal>

         {/* Giao diện xác nhận đơn đặt */}
         <Modal
            title={
               <div className="flex items-center gap-1">
                  <h3>Xác nhận đơn đặt của</h3>
                  <h3
                     title={currentBooking?.user?.fullName}
                     className="text-[20px] text-blue-500 format"
                  >
                     {currentBooking?.user?.fullName}
                  </h3>
               </div>
            }
            onCancel={handleCloseConfirmModal}
            footer={
               <div className="flex items-center justify-end gap-2">
                  <Button size="large" danger onClick={handleCloseConfirmModal}>
                     Hủy
                  </Button>
                  <Button
                     loading={isConfirmloading}
                     type="primary"
                     size="large"
                     onClick={() => handleConfirmBooking()}
                  >
                     Xác nhận
                  </Button>
               </div>
            }
            open={isShowConfirmModal}
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắc chắn xác nhận chuyến du lịch ở</p>
               <p
                  title={currentBooking?.dayDetail?.tour?.tourName}
                  className="format font-semibold text-blue-500"
               >
                  {currentBooking?.dayDetail?.tour?.tourName}
               </p>
            </div>
         </Modal>

         {/* Giao diện header của Đơn đặt */}
         <div className="mb-4">
            <h3 className="text-[24px] font-semibold">Đơn đặt</h3>
         </div>

         {/* Giao diện tìm kiếm đơn đặt */}
         <div
            id="search-order"
            className="flex gap-5 items-center justify-start mb-3"
         >
            <div className="flex gap-2 items-center">
               <p>Trạng thái</p>
               <Select
                  defaultValue="all"
                  onChange={(value) => {
                     setCheckStatus(value); // Cập nhật trạng thái
                     setCurrentPage(1); // RESET VỀ TRANG 1
                  }} // Cập nhật thể loại
                  style={{ width: 160 }}
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },
                     {
                        value: "PENDING",
                        label: "Đang chờ xử lý",
                     },
                     {
                        value: "CONFIRMED",
                        label: "Đã xác nhận",
                     },
                     {
                        value: "WAITING_FOR_PAYMENT",
                        label: "Chờ thanh toán",
                     },
                     {
                        value: "PAID",
                        label: "Đã thanh toán",
                     },
                     {
                        value: "CANCELED",
                        label: "Đã hủy",
                     },
                  ]}
               />
            </div>
            <div className="flex gap-2 items-center">
               <p>Người đặt</p>
               <Select
                  defaultValue="all"
                  onChange={(value) => {
                     setCheckUserId(value); // Cập nhật trạng thái
                     setCurrentPage(1); // RESET VỀ TRANG 1
                  }} // Cập nhật thể loại
                  loading={isUserLoading}
                  className="w-[180px]!"
                  showSearch
                  placeholder="Chọn người đặt"
                  optionFilterProp="label"
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },

                     ...users
                        ?.filter((user) => user.status === true)
                        .map((user) => ({
                           value: user.id,
                           label: user.fullName,
                        })),
                  ]}
               />
            </div>
         </div>

         {/* Giao diện bảng dữ liệu của Đơn đặt */}
         <div>
            <Table
               loading={isBookingLoading}
               columns={columns}
               dataSource={data}
               pagination={false}
            />
         </div>

         {/* Giao diện phân trang */}
         <div className="flex justify-end">
            {totalElements <= 8 ? (
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
                     pageSizeOptions={[8, 16, 32, 50, 100]}
                  />
               </div>
            )}
         </div>
      </>
   );
}
