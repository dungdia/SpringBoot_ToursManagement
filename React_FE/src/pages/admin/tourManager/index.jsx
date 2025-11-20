import { getAllAreasNotFilter } from "@/services/areaService";
import { createTour, getAllToursNotFilter } from "@/services/tourService";
import {
   vietnameseCurrencyFormatter,
   vietnameseCurrencyParser,
} from "@/utils/vaidate";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
   Button,
   DatePicker,
   Form,
   Input,
   InputNumber,
   message,
   Modal,
   Pagination,
   Select,
   Space,
   Table,
} from "antd";
import { HttpStatusCode } from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./tourManager.css";
import dayjs from "dayjs";

export default function TourManager() {
   // Formatter cho ngày
   const DATETIME_FORMAT = "DD-MM-YYYY HH:mm:ss";
   // Hàm validation cho ngày quá khứ
   const disabledPastDate = (current) => {
      // Chỉ chọn ngày từ ngày hiện tại trở đi
      return current && current < dayjs().startOf("day");
   };

   // Cho form thêm / cập nhật khu vực
   const tourNameRef = useRef();
   const [formAddOrUpdateTour] = Form.useForm();
   const [isTourLoading, setIsTourLoading] = useState(false);
   const [tours, setTours] = useState([]);
   const [areas, setAreas] = useState([]);
   const [isShowModal, setIsShowModal] = useState(false);
   const [isloading, setIsLoading] = useState(false);

   const columns = [
      {
         title: "Tên chuyến đi",
         dataIndex: "tourName",
         key: "tourName",
         render: (_, tour) => (
            <p title={tour.tourName} className="format">
               {tour.tourName}
            </p>
         ),
      },
      {
         title: "Khu vực",
         dataIndex: "area",
         key: "area",
         render: (_, tour) => (
            <p title={tour.areaName} className="format text-[#eb2f96]">
               {tour.areaName}
            </p>
         ),
      },
      {
         title: "Miêu tả",
         dataIndex: "description",
         key: "description",
         render: (_, tour) => (
            <p title={tour.description} className="format text-[#1677ff]">
               {tour.description}
            </p>
         ),
      },
      {
         title: "Hình ảnh",
         key: "action-image",
         dataIndex: "action-image",
         render: () => (
            <Button
               size="large"
               type="default"
               style={{
                  color: "#fff", // Màu chữ
                  borderColor: "#faad14", // Màu viền
                  backgroundColor: "#faad14", // Màu nền
               }}
            >
               Xem ảnh
            </Button>
         ),
      },
      {
         title: "Lịch trình",
         key: "action-schedule",
         dataIndex: "action-schedule",
         render: () => (
            <Button color="purple" variant="solid" size="large">
               Xem lịch
            </Button>
         ),
      },
      {
         title: "Hành động",
         key: "action",
         render: (_, tour) => {
            return (
               <div className="flex gap-2 items-center">
                  {/* NÚT KHÓA / XÓA*/}
                  {
                     <Button
                        // onClick={() => handleShowModalDelete(tour.id)}
                        size="large"
                        type="primary"
                        danger
                        ghost
                     >
                        Xóa
                     </Button>
                  }
                  {
                     <Button
                        size="large"
                        // onClick={() => handleEditTour(tour)}
                        type="primary"
                        ghost
                     >
                        Sửa
                     </Button>
                  }
               </div>
            );
         },
      },
   ];

   const data = tours?.map((tour) => {
      return {
         id: tour.id,
         key: tour.id,
         tourName: tour.tourName,
         areaId: tour.area.id,
         areaName: tour.area.areaName,
         area: tour.area,
         description: tour.description,
      };
   });

   const fetchTours = async () => {
      setIsTourLoading(true);
      const response = await getAllToursNotFilter();
      setTours(response.data);
   };

   const fetchAreas = async () => {
      const response = await getAllAreasNotFilter();
      setAreas(response.data.content);
   };

   useEffect(() => {
      fetchTours();
      fetchAreas();
   }, []);

   // Hiển thị modal thêm
   const handleShowModal = () => {
      setIsShowModal(true);

      setTimeout(() => {
         if (tourNameRef.current) {
            tourNameRef.current.focus();
         }
      }, 100);
   };

   // Ẩn modal thêm
   const handleCloseModal = () => {
      setIsShowModal(false);
      // setBaseId(null);
      formAddOrUpdateTour.resetFields();
   };

   // Hàm xác nhận thêm / cập nhật khu vực
   const onFinish = async (values) => {
      const processedValues = { ...values };

      if (processedValues.dayDetails && processedValues.dayDetails.length > 0) {
         processedValues.dayDetails = processedValues.dayDetails.map(
            (detail) => {
               // Đảm bảo chỉ định dạng nếu giá trị tồn tại và là đối tượng Dayjs
               const departureDateFormatted = detail.departureDate
                  ? detail.departureDate.format(DATETIME_FORMAT)
                  : null;

               const returnDateFormatted = detail.returnDate
                  ? detail.returnDate.format(DATETIME_FORMAT)
                  : null;

               return {
                  ...detail,
                  departureDate: departureDateFormatted,
                  returnDate: returnDateFormatted,
               };
            }
         );
      }

      try {
         // Gửi processedValues thay vì values gốc
         const responseCreate = await createTour(processedValues);

         if (responseCreate.status === 201) {
            message.success("Thêm chuyến đi thành công!");
         } else {
            message.error("Thêm chuyến đi thất bại, vui lòng thử lại!");
            return;
         }
         fetchTours();
         handleCloseModal();
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         {/* Giao diện thêm / cập nhật khu vực */}
         <Modal
            footer={false}
            // title={baseId ? "Cập nhật khu vực" : "Thêm khu vực"}
            title="Thêm chuyến đi"
            open={isShowModal}
            onCancel={handleCloseModal}
         >
            <Form
               form={formAddOrUpdateTour}
               name="add-or-update-tour"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinish}
               autoComplete="off"
               requiredMark={false}
            >
               <Form.Item
                  label="Tên chuyến đi"
                  name="tourName"
                  rules={[
                     {
                        required: true,
                        message: "Vui lòng nhập tên chuyến đi!",
                     },
                  ]}
               >
                  <Input ref={tourNameRef} />
               </Form.Item>

               <Form.Item
                  label="Khu vực"
                  name="areaId"
                  rules={[
                     {
                        required: true,
                        message: "Khu vực không bỏ trống",
                     },
                  ]}
               >
                  <Select
                     placeholder="Chọn Khu vực"
                     options={areas
                        ?.filter((area) => area.status === true)
                        .map((area) => ({
                           value: area.id,
                           label: area.areaName,
                        }))}
                  />
               </Form.Item>

               {/* Hình ảnh */}
               <Form.List
                  name="images"
                  rules={[
                     {
                        // Đảm bảo ít nhất một hình ảnh được nhập
                        validator: async (_, images) => {
                           if (
                              !images ||
                              images.length === 0 ||
                              images.every((img) => !img)
                           ) {
                              return message.error(
                                 "Vui lòng thêm ít nhất một hình ảnh!"
                              );
                           }
                           return Promise.resolve();
                        },
                     },
                  ]}
               >
                  {(fields, { add, remove }) => (
                     <>
                        <label
                           style={{ display: "block", marginBottom: "8px" }}
                        >
                           Hình ảnh (URLs)
                        </label>
                        {/* Lặp qua các trường hiện có */}
                        {fields.map((field, index) => (
                           <Space
                              key={field.key} // KEY luôn ở phần tử ngoài cùng (Space)
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                           >
                              {/* Input cho từng URL hình ảnh */}
                              <Form.Item
                                 // ⭐ SỬA: BỎ {...field} để loại bỏ lỗi spread key ⭐
                                 name={[field.name]} // Chỉ truyền name và các props khác
                                 rules={[
                                    {
                                       required: true,
                                       message: "URL hình ảnh không được trống",
                                    },
                                 ]}
                                 style={{ flexGrow: 1, marginBottom: 0 }}
                              >
                                 <Input
                                    placeholder={`URL hình ảnh ${index + 1}`}
                                 />
                              </Form.Item>

                              {/* Nút xóa */}
                              <MinusCircleOutlined
                                 onClick={() => remove(field.name)}
                              />
                           </Space>
                        ))}

                        {/* Nút thêm */}
                        <Form.Item>
                           <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                           >
                              Thêm Hình ảnh
                           </Button>
                        </Form.Item>
                     </>
                  )}
               </Form.List>

               {/* Chi tiết ngày */}
               <Form.List
                  name="dayDetails"
                  // Mảng dayDetails không được rỗng (ít nhất 1 mục)
                  rules={[
                     {
                        validator: async (_, dayDetails) => {
                           if (!dayDetails || dayDetails.length === 0) {
                              return message.error(
                                 "Vui lòng thêm ít nhất một chi tiết chuyến đi!"
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
                              <h3>Chi tiết Chuyến đi #{name + 1}</h3>

                              {/* 1. Ngày khởi hành */}
                              <Form.Item
                                 {...restField}
                                 name={[name, "departureDate"]}
                                 label="Ngày khởi hành"
                                 rules={[
                                    {
                                       required: true,
                                       message: "Ngày khởi hành không để trống",
                                    },
                                 ]}
                              >
                                 <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="Chọn ngày khởi hành"
                                    showTime={{ format: "HH:mm:ss" }} // Hiển thị chọn giờ/phút/giây
                                    format={DATETIME_FORMAT} // Định dạng đầu ra/hiển thị
                                    disabledDate={disabledPastDate} // Ngăn chọn ngày quá khứ
                                 />
                              </Form.Item>

                              {/* 2. Ngày trở về */}
                              <Form.Item
                                 {...restField}
                                 name={[name, "returnDate"]}
                                 label="Ngày trở về"
                                 rules={[
                                    {
                                       required: true,
                                       message: "Ngày trở về không để trống",
                                    },
                                    {
                                       // Validation chéo: Ngày trở về phải sau hoặc bằng ngày khởi hành
                                       validator: (_, value) => {
                                          // Lấy giá trị của trường ngày khởi hành từ cùng một mục (item)
                                          const departureDate =
                                             formAddOrUpdateTour.getFieldValue([
                                                "dayDetails",
                                                name,
                                                "departureDate",
                                             ]);

                                          if (!value || !departureDate) {
                                             return Promise.resolve(); // Bỏ qua nếu một trong hai chưa được chọn (required đã xử lý)
                                          }

                                          // So sánh ngày trở về (value) phải sau hoặc bằng ngày khởi hành (departureDate)
                                          if (value.isBefore(departureDate)) {
                                             return Promise.reject(
                                                new Error(
                                                   "Ngày trở về phải sau hoặc cùng ngày khởi hành!"
                                                )
                                             );
                                          }

                                          return Promise.resolve();
                                       },
                                    },
                                 ]}
                              >
                                 <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="Chọn ngày trở về"
                                    showTime={{ format: "HH:mm:ss" }}
                                    format={DATETIME_FORMAT}
                                    disabledDate={disabledPastDate} // Ngăn chọn ngày quá khứ
                                 />
                              </Form.Item>

                              {/* 3. Số lượng chỗ */}
                              <Form.Item
                                 name={[name, "slot"]}
                                 label="Số lượng chỗ"
                                 rules={[
                                    {
                                       required: true,
                                       message: "Số lượng chỗ không để trống",
                                    },
                                    {
                                       validator: (_, value) => {
                                          // Kiểm tra nếu giá trị tồn tại và nhỏ hơn hoặc bằng 49
                                          if (value && value <= 49) {
                                             return Promise.reject(
                                                new Error(
                                                   "Số lượng chỗ phải lớn hơn hoặc bằng 50!"
                                                )
                                             );
                                          }
                                          // Nếu giá trị rỗng, quy tắc required đã xử lý
                                          return Promise.resolve();
                                       },
                                    },
                                 ]}
                              >
                                 <InputNumber min={50} max={200} />
                              </Form.Item>

                              {/* 4. Chi phí */}
                              <Form.Item
                                 name={[name, "price"]}
                                 label="Chi phí"
                                 rules={[
                                    {
                                       required: true,
                                       message: "Chi phí không để trống",
                                    },
                                    {
                                       // Giữ nguyên logic validator
                                       validator: (_, value) => {
                                          // Nếu giá trị tồn tại (không null/undefined) và nhỏ hơn hoặc bằng 0
                                          if (
                                             value !== null &&
                                             value !== undefined &&
                                             value <= 0
                                          ) {
                                             return Promise.reject(
                                                new Error(
                                                   "Chi phí phải lớn hơn 0!"
                                                )
                                             );
                                          }
                                          return Promise.resolve();
                                       },
                                    },
                                 ]}
                              >
                                 <InputNumber
                                    style={{ width: "100%" }}
                                    min={1}
                                    max={1000000000}
                                    formatter={vietnameseCurrencyFormatter}
                                    parser={vietnameseCurrencyParser}
                                 />
                              </Form.Item>

                              {/* Nút xóa item */}
                              <MinusCircleOutlined
                                 onClick={() => {
                                    remove(name);
                                    formAddOrUpdateTour.validateFields([
                                       "dayDetails",
                                    ]);
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
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                           >
                              Thêm Chi tiết Chuyến đi
                           </Button>
                        </Form.Item>
                     </>
                  )}
               </Form.List>

               <Form.Item
                  label="Miêu tả"
                  name="description"
                  rules={[
                     {
                        required: true,
                        message: "Miêu tả không để trống",
                     },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isloading}
                        color="primary"
                        variant="outlined"
                        size="large"
                        htmlType="submit"
                     >
                        {/* {baseId ? "Cập nhật" : "Thêm"} */}
                        {"Thêm"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện header và Add chuyến đi */}
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-[24px] font-semibold">Chuyến đi</h3>
            <Button onClick={handleShowModal} type="primary" size="large">
               Thêm chuyến
            </Button>
         </div>

         {/* Giao diện tìm kiếm chuyến đi */}
         <div
            id="search-tour"
            className="flex gap-5 items-center justify-start mb-3"
         >
            <div className="flex gap-2 items-center">
               <p>Trạng thái</p>
               <Select
                  defaultValue="all"
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
            <div>
               <Input.Search
                  placeholder="Tìm kiếm khu vực"
                  className="w-[350px]"
                  allowClear
               />
            </div>
         </div>

         {/* Giao diện bảng dữ liệu chuyến đi */}
         <div className="mb-4">
            <Table columns={columns} dataSource={data} pagination={false} />
         </div>

         {/* Giao diện phân trang */}
         <div className="flex justify-end">
            <Pagination
               total={85}
               showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
               }
               defaultPageSize={20}
               defaultCurrent={1}
            />
         </div>
      </>
   );
}
