import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Đã thêm Spin để hiển thị trạng thái loading tốt hơn
import {
   Button,
   Image,
   Select,
   message,
   Spin,
   Modal,
   Form,
   Space,
   Input,
   InputNumber,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getTourById } from "@/services/tourService";
import { decryptData } from "@/utils/CryptoJS";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { createBooking } from "@/services/BookingService";
import { HttpStatusCode } from "axios";
import {
   findUserInfoByEmail,
   sendEmailPendingOrCancelOrPaidBooking,
} from "@/services/userService";

dayjs.extend(customParseFormat);

// --- Hàm Tiện ích ---
const toTitleCase = (str) => {
   if (!str) return "";
   return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
};

// Hàm tính số ngày giữa ngày khởi hành và ngày kết thúc
const calculateDuration = (departure, returnDate) => {
   // Định dạng ngày của bạn là "DD-MM-YYYY HH:mm:ss"
   const start = dayjs(departure, "DD-MM-YYYY HH:mm:ss");
   const end = dayjs(returnDate, "DD-MM-YYYY HH:mm:ss");
   if (!start.isValid() || !end.isValid()) return "N/A";

   // Tính số ngày chênh lệch (bao gồm ngày khởi hành và kết thúc)
   const diff = end.diff(start, "day") + 1;
   return `${diff} Ngày`;
};

// Dùng tải Spin
const contentStyle = {
   padding: 50,
   background: "rgba(0, 0, 0, 0.05)",
   borderRadius: 4,
};
const content = <div style={contentStyle} />;

export default function SelectTour() {
   const navigate = useNavigate();
   const { tourId: tourIdParam } = useParams();
   const { email: emailParam } = useParams();
   const tourId = decryptData(decodeURIComponent(tourIdParam));

   const [tour, setTour] = useState(null);
   const [isTourLoading, setIsTourLoading] = useState(true); // Đổi thành true để hiển thị loading lúc đầu
   const [currentMainImage, setCurrentMainImage] = useState("");
   const [selectedDayDetailId, setSelectedDayDetailId] = useState(null);

   // Đặt chuyến
   const customerNameRef = useRef();
   const [formBookingTour] = Form.useForm();
   const [isShowModalBooking, setIsShowModalBooking] = useState(false);
   const [isBookingLoading, setIsBookingLoading] = useState(false);

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogged =
      JSON.parse(localStorage.getItem("accountLogged")) || {};

   // Hàm xử lý dữ liệu và đặt ảnh/chi tiết ngày mặc định
   const processTourData = (data) => {
      if (!data || !data.id) return;

      // 1. Sắp xếp ảnh và chọn ảnh chính mặc định
      const sortedImages = [...data.images].sort((a, b) => a.id - b.id);
      const defaultMainImage =
         sortedImages.length > 0 ? sortedImages[0].url : "Chưa có ảnh";

      // 2. Chọn chi tiết ngày mặc định (ID nhỏ nhất)
      let defaultDayDetailId = null;
      if (data.dayDetails && data.dayDetails.length > 0) {
         const defaultDayDetail = [...data.dayDetails].sort(
            (a, b) => a.id - b.id
         )[0];
         defaultDayDetailId = defaultDayDetail.id;
      }

      setTour({ ...data, images: sortedImages });
      setCurrentMainImage(defaultMainImage);
      setSelectedDayDetailId(defaultDayDetailId);
   };

   const fetchTour = async () => {
      try {
         setIsTourLoading(true);

         if (
            accountLogged.email !== decryptData(decodeURIComponent(emailParam))
         ) {
            message.error(
               "Liên kết không hợp lệ hoặc bạn không có quyền truy cập."
            );
            navigate("/user");
         }

         const response = await getTourById(tourId);

         if (response.status === 200 && response.data) {
            processTourData(response.data);
         } else {
            message.error("Không tìm thấy thông tin chuyến đi.");
            setTour(null);
         }
      } catch (error) {
         message.error("Lỗi khi tải dữ liệu chuyến đi. Vui lòng thử lại.");
         console.error(error);
         setTour(null);
      } finally {
         setIsTourLoading(false);
      }
   };

   useEffect(() => {
      // Chỉ gọi API thật
      fetchTour();
   }, [tourId]);

   // Loại bỏ useEffect xử lý mockTourData

   // --- KIỂM TRA TRẠNG THÁI ---
   if (isTourLoading) {
      return (
         <div className="container mx-auto py-32 text-center flex justify-center">
            <Spin
               tip="Đang tải thông tin chuyến đi..."
               size="large"
               wrapperClassName="p-4"
            >
               {content}
            </Spin>
         </div>
      );
   }

   if (
      !tour ||
      !tour.dayDetails ||
      tour.dayDetails.length === 0 ||
      selectedDayDetailId === null
   ) {
      return (
         <div className="container mx-auto py-32 text-center text-xl">
            <h2 className="text-red-500 font-bold mb-4">
               {tour
                  ? "Tour không có ngày khởi hành hợp lệ."
                  : "Không tìm thấy thông tin tour."}
            </h2>
            <Button type="primary" onClick={() => navigate("/user")}>
               Quay về Trang Chủ
            </Button>
         </div>
      );
   }

   // Lấy chi tiết ngày được chọn
   const selectedDayDetail = tour.dayDetails.find(
      (d) => d.id === selectedDayDetailId
   );

   // Xử lý dữ liệu hiển thị (Đã KHÔI PHỤC LOGIC BAN ĐẦU)
   const formattedTourName = toTitleCase(tour.tourName);
   const formattedAreaName = toTitleCase(tour?.area?.areaName);
   const formattedPrice = selectedDayDetail
      ? selectedDayDetail.price.toLocaleString("vi-VN")
      : "Chưa có";
   const departureDate = selectedDayDetail
      ? dayjs(selectedDayDetail.departureDate, "DD-MM-YYYY HH:mm:ss").format(
           "DD/MM/YYYY"
        )
      : "Chưa chọn";
   const returnDate = selectedDayDetail
      ? dayjs(selectedDayDetail.returnDate, "DD-MM-YYYY HH:mm:ss").format(
           "DD/MM/YYYY"
        )
      : "Chưa chọn";
   const duration = selectedDayDetail
      ? calculateDuration(
           selectedDayDetail.departureDate,
           selectedDayDetail.returnDate
        )
      : "Chưa chọn";
   const isSlotAvailable = selectedDayDetail && selectedDayDetail.slot > 0;

   // Lựa chọn (Options) cho Select component
   const dayDetailOptions = tour.dayDetails
      .filter((d) => d.status === true) // Chỉ lấy các chi tiết ngày đang hoạt động
      .map((d) => ({
         value: d.id,
         label: `${dayjs(d.departureDate, "DD-MM-YYYY HH:mm:ss").format(
            "DD/MM/YYYY"
         )} - ${dayjs(d.returnDate, "DD-MM-YYYY HH:mm:ss").format(
            "DD/MM/YYYY"
         )} => ${d.price.toLocaleString("vi-VN")} VNĐ`,
         price: d.price,
         slot: d.slot,
      }));

   // Hàm mở modal đặt tour
   const handleShowModalBooking = () => {
      setIsShowModalBooking(true);
   };

   // Hàm ẩn modal đặt tour
   const handleCloseModalBooking = () => {
      setIsShowModalBooking(false);
      formBookingTour.resetFields();
   };

   const onFinishBooking = async (values) => {
      try {
         setIsBookingLoading(true);

         if (
            accountLogged?.email === null ||
            accountLogged?.fullName === null ||
            accountLogged?.gender === null ||
            accountLogged?.address === null ||
            accountLogged?.phone === null
         ) {
            message.warning(
               "Vui lòng cập nhật đầy đủ thông tin trước khi đặt chuyến đi!"
            );
            handleCloseModalBooking()
            return;
         }

         const responseUser = await findUserInfoByEmail(accountLogged?.email);
         console.log("responseUser ", responseUser);

         if (!responseUser) {
            message.error("Không lấy được thông tin người dùng!");
            return;
         }

         // 1. CHUẨN BỊ PAYLOAD THEO FORMAT API
         const bookingPayload = {
            userId: responseUser?.id, // Lấy từ auth context hoặc storage
            dayDetailId: selectedDayDetailId,
            customers: values.customers.map((customer) => ({
               customerName: customer.customerName,
               age: customer.age,
               phone: customer.phone, // Trường này có thể là optional, nhưng gửi đi là tốt
               gender: customer.gender,
            })),
         };

         const response = await createBooking(bookingPayload);
         console.log("response ", response);

         if (response.status === 201) {
            const responseSendEmail =
               await sendEmailPendingOrCancelOrPaidBooking(
                  accountLogged?.email,
                  "PENDING",
                  response.data
               );
            console.log("responseSendEmail ", responseSendEmail);

            if (responseSendEmail) {
               message.success(
                  "Đã gửi thông báo đặt thành công đến Email của bạn"
               );
               message.success("Đặt chuyến đi thành công");
               setSelectedDayDetailId(null);
               fetchTour();
               handleCloseModalBooking();
               navigate("/user");
            }
         }
      } catch (error) {
         console.log(error);

         if (error.response.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
      } finally {
         setIsBookingLoading(false);
      }
   };

   return (
      <>
         {/* Giao diện đặt tour có thêm customer */}
         <Modal
            title={
               <>
                  <div className="flex items-center gap-1">
                     <h3>Đặt chuyến đi lúc</h3>
                     <h3 className="text-amber-400">{departureDate}</h3>
                     <h3>tới</h3>
                     <h3 className="text-blue-400">{returnDate}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                     <h3>Số chỗ còn lại:</h3>
                     <h3 className="text-cyan-400">
                        {selectedDayDetail?.slot}
                     </h3>
                  </div>
               </>
            }
            footer={false}
            onCancel={handleCloseModalBooking}
            open={isShowModalBooking}
         >
            <Form
               form={formBookingTour}
               name="booking-tour"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinishBooking}
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
                                    // ref={customerNameRef}
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
                        onClick={handleCloseModalBooking}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isBookingLoading}
                        color="primary"
                        variant="outlined"
                        size="large"
                        htmlType="submit"
                     >
                        {"Đặt chuyến"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện đặt tour */}
         <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT - Ảnh đại diện + danh sách ảnh + Mô tả */}
            <div className="lg:col-span-2">
               {/* Tiêu đề Tour */}
               <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b pb-3">
                     {formattedTourName}{" "}
                     <span className="text-xl text-gray-500">
                        ({formattedAreaName})
                     </span>
                  </h1>
                  <Button
                     onClick={() => {
                        // tourId = null; // Đoạn code này gây lỗi và không cần thiết
                        navigate("/user");
                     }}
                     size="large"
                     color="cyan"
                     variant="solid"
                     className="bg-cyan-500 text-white hover:!bg-cyan-600 border-none"
                  >
                     Về trang chủ
                  </Button>
               </div>

               {/* Ảnh Đại Diện - Dùng Image của Antd (Giữ nguyên CSS) */}
               <div className="relative flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden mb-5">
                  <Image
                     preview={false}
                     src={currentMainImage}
                     alt={tour?.tourName}
                     // LỚP CSS CŨ ĐÃ KHÔI PHỤC
                     className="w-full h-[550px] object-cover transition-transform! duration-500! ease-in-out"
                     style={{ width: "100%", height: 550 }}
                     placeholder={
                        <div className="w-full h-[550px] bg-gray-200 flex items-center justify-center text-gray-500">
                           Đang tải ảnh...
                        </div>
                     }
                  />
               </div>

               {/* Danh sách ảnh (Thumbnails) - Đã KHÔI PHỤC thẻ <img> ban đầu */}
               <div className="flex items-center justify-center gap-4 mt-10 overflow-x-auto p-5">
                  {tour.images.map((image) => (
                     <div
                        key={image.id}
                        onClick={() => setCurrentMainImage(image.url)}
                        className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden cursor-pointer transition duration-300 border-4 ${
                           currentMainImage === image.url
                              ? "border-blue-500 ring-2 ring-blue-500 scale-105 shadow-md"
                              : "border-gray-200 hover:border-blue-300"
                        }`}
                     >
                        <img
                           src={image.url}
                           alt={`Thumbnail ${image.id}`}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  ))}
               </div>

               {/* --- Mô tả chi tiết Tour --- */}
               <div className="mt-10 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                     Mô Tả Tour
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                     {tour.description}
                  </p>
                  <p className="mt-4 text-blue-600 font-medium">
                     Khu vực: **{formattedAreaName}**
                  </p>
               </div>
            </div>

            {/* RIGHT - Thông tin Tour và Đặt lịch (Sticky Card) */}
            <div className="lg:col-span-1">
               <div className="p-6 rounded-2xl shadow-2xl border border-blue-100 bg-white sticky top-20 flex flex-col gap-5">
                  <h2 className="text-2xl font-bold text-blue-600 border-b pb-3">
                     Chọn Ngày & Đặt Chuyến
                  </h2>

                  {/* KHU VỰC CHỌN NGÀY VÀ GIÁ */}
                  <div className="space-y-4">
                     <div className="font-medium text-gray-700">
                        **Chọn ngày khởi hành:**
                     </div>
                     <Select
                        className="w-full h-10"
                        value={selectedDayDetailId} // Đã sửa lại để binding với state
                        onChange={setSelectedDayDetailId}
                        options={dayDetailOptions}
                        placeholder="Chọn ngày khởi hành và giá"
                        size="large"
                     />
                  </div>

                  {/* Chi tiết ngày khởi hành */}
                  <div className="flex justify-between items-center border-b pb-3">
                     <p className="text-gray-600 font-medium">Khởi hành:</p>
                     <p className="text-xl font-bold text-gray-800">
                        {departureDate}
                     </p>
                  </div>

                  {/* Chi tiết ngày trở về */}
                  <div className="flex justify-between items-center border-b pb-3">
                     <p className="text-gray-600 font-medium">Trở về:</p>
                     <p className="text-xl font-bold text-gray-800">
                        {returnDate}
                     </p>
                  </div>

                  {/* Chi tiết thời lượng */}
                  <div className="flex justify-between items-center border-b pb-3">
                     <p className="text-gray-600 font-medium">Thời lượng:</p>
                     <p className="text-xl font-bold text-gray-800">
                        {duration}
                     </p>
                  </div>

                  {/* Chi tiết chỗ còn */}
                  <div className="flex justify-between items-center border-b pb-3">
                     <p className="text-gray-600 font-medium">Số chỗ còn:</p>
                     <p
                        className={`text-xl font-bold ${
                           selectedDayDetail && selectedDayDetail.slot < 10
                              ? "text-red-500"
                              : "text-green-500"
                        }`}
                     >
                        {selectedDayDetail?.slot || 0}
                     </p>
                  </div>

                  {/* Giá CUỐI CÙNG */}
                  <div className="pt-2">
                     <p className="text-gray-600 text-sm mb-1">
                        Giá tour (mỗi khách):
                     </p>
                     <p className="text-4xl font-extrabold text-red-600">
                        {formattedPrice}{" "}
                        <span className="text-2xl ml-1">VNĐ</span>
                     </p>
                  </div>

                  {/* Nút Đặt chuyến */}
                  <Button
                     type="primary"
                     size="large"
                     className="mt-4 w-full py-3 h-auto text-xl font-bold rounded-full bg-blue-600 hover:!bg-blue-700 transition duration-300 shadow-lg"
                     onClick={handleShowModalBooking} // Thêm onClick
                     disabled={!isSlotAvailable} // Vô hiệu hóa nếu hết chỗ
                  >
                     {isSlotAvailable ? (
                        <span>
                           <i className="fa-solid fa-cart-shopping mr-2"></i>{" "}
                           **ĐẶT CHUYẾN NGAY**
                        </span>
                     ) : (
                        <span>**HẾT CHỖ**</span>
                     )}
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-2">
                     <i className="fa-solid fa-check-circle mr-1 text-green-500"></i>{" "}
                     Đảm bảo giá chính xác
                  </p>
               </div>
            </div>
         </div>
      </>
   );
}
