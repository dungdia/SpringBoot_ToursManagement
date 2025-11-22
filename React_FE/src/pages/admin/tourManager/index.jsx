import { getAllAreasNotFilter } from "@/services/areaService";
import {
   createImagesForTour,
   createTour,
   getAllImagesUrlsByTourId,
   getAllTours,
   getAllToursNotFilter,
   removeImageByTourIdAndImageId,
   updateImagesForTour,
} from "@/services/tourService";
import {
   vietnameseCurrencyFormatter,
   vietnameseCurrencyParser,
} from "@/utils/vaidate";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
   Button,
   DatePicker,
   Form,
   Image,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./tourManager.css";
import dayjs from "dayjs";
import { useDebounce } from "@/hooks/useDebounce";

export default function TourManager() {
   // Formatter cho ngày
   const DATETIME_FORMAT = "DD-MM-YYYY HH:mm:ss";
   // Hàm validation cho ngày quá khứ
   const disabledPastDate = (current) => {
      // Chỉ chọn ngày từ ngày hiện tại trở đi
      return current && current < dayjs().startOf("day");
   };

   // baseId
   const [baseId, setBaseId] = useState(null);

   // Giao diện tour =======================================================================================================
   // Cho form thêm / cập nhật tour
   const tourNameRef = useRef();
   const [formAddOrUpdateTour] = Form.useForm();
   const [isTourLoading, setIsTourLoading] = useState(false);
   const [tours, setTours] = useState([]);
   const [areas, setAreas] = useState([]);
   const [isShowModal, setIsShowModal] = useState(false);
   const [isloading, setIsLoading] = useState(false);
   const [valueImageAddTour, setValueImageAddTour] = useState([""]);
   const debounceValueImageAddTour = useDebounce(valueImageAddTour, 800);
   // Theo dõi giá trị của trường 'images' (là một mảng)
   const formImageUrlsForTour = Form.useWatch("images", formAddOrUpdateTour);

   // Phân trang
   const [totalElements, setTotalElements] = useState(0);
   const [searchValue, setSearchValue] = useState("");
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(8);
   const [checkAreaId, setCheckAreaId] = useState("all");

   // Giao diện xem hình ảnh ================================================================================================
   const [isShowImagesURLsModal, setIsShowImagesURLsModal] = useState(false);
   const [imagesURLs, setImagesURLs] = useState([]);
   const [isImageLoading, setIsImageLoading] = useState(false);

   // Cho form thêm
   const [formAddImages] = Form.useForm();
   const [isShowAddImageModal, setIsShowAddImageModal] = useState(false);
   const [isAddImageLoading, setIsAddImageLoading] = useState(false);
   const [valueImageAddImage, setValueImageAddImage] = useState([""]);
   const debounceValueImageAddImage = useDebounce(valueImageAddImage, 800);
   // Theo dõi giá trị của trường 'images' (là một mảng)
   const formImageUrlsForImage = Form.useWatch("images", formAddImages);

   // Cho form câp nhật ảnh
   const updateImage = useRef();
   const [formUpdateImage] = Form.useForm();
   const [isShowUpdateImageModal, setIsShowUpdateImageModal] = useState(false);
   const [isUpdateImageLoading, setIsUpdateImageLoading] = useState(false);
   const [valueImageUpdateImage, setValueImageUpdateImage] = useState("");
   const debounceValueImageUpdateImage = useDebounce(
      valueImageUpdateImage,
      800
   );

   // Modal xóa hình ảnh
   const [baseImageId, setBaseImageId] = useState(null);
   const [isShowImageModalDelete, setIsShowImageModalDelete] = useState(false);
   const [isDeleteImageLoading, setIsDeleteImageLoading] = useState(false);

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
         title: "Đơn đặt",
         dataIndex: "isBooking",
         key: "isBooking",
         render: (_, tour) => (
            <p
               className={
                  tour.isBooking
                     ? "font-semibold text-[#ff8904]"
                     : "font-semibold text-[#722ed1]"
               }
            >
               {tour.isBooking ? "Đã đặt" : "Chưa đặt"}
            </p>
         ),
      },
      {
         title: "Hình ảnh",
         key: "action-image",
         dataIndex: "action-image",
         render: (_, tour) => (
            <Button
               onClick={() => handleShowImagesURLs(tour.id)}
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
         isBooking: tour.isBooking,
         areaId: tour.area.id,
         areaName: tour.area.areaName,
         area: tour.area,
         description: tour.description,
      };
   });

   // Đồng bộ Form Value vào state React (để phục vụ debounceValueImageAddTour)
   useEffect(() => {
      // Chỉ cập nhật state nếu formImageUrls tồn tại và là mảng
      if (Array.isArray(formImageUrlsForTour)) {
         // Form.List trả về mảng giá trị (string)
         setValueImageAddTour(formImageUrlsForTour);
      }
   }, [formImageUrlsForTour]);

   // Đồng bộ Form Value vào state React (để phục vụ debounceValueImageAddImage)
   useEffect(() => {
      // Chỉ cập nhật state nếu formImageUrls tồn tại và là mảng
      if (Array.isArray(formImageUrlsForImage)) {
         // Form.List trả về mảng giá trị (string)
         setValueImageAddImage(formImageUrlsForImage);
      }
   }, [formImageUrlsForImage]);

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   const fetchTours = useCallback(async () => {
      setIsTourLoading(true);

      const pageIndex = currentPage - 1;

      const areaId = checkAreaId === "all" ? null : checkAreaId;

      const response = await getAllTours(
         debounceSearch,
         pageIndex,
         pageSize,
         areaId
      );
      setTours(response.content);

      setTotalElements(response.totalElements);
      setIsTourLoading(false);
   }, [debounceSearch, currentPage, pageSize, checkAreaId]);

   const fetchAreas = async () => {
      const response = await getAllAreasNotFilter();

      setAreas(response.data);
   };

   useEffect(() => {
      fetchAreas();
      fetchTours();
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
      formAddOrUpdateTour.resetFields();
      setValueImageAddTour([""]);
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

   // Theo dõi các bộ lọc và trang để tự động gọi API khi chúng thay đổi
   useEffect(() => {
      // Sẽ lấy dữ liệu người dùng khi các tham số lọc thay đổi
      fetchTours();
   }, [fetchTours]);

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   // =====================================================================================================================
   // GIAO DIỆN XEM HÌNH ẢNH
   // =====================================================================================================================

   const handleShowImagesURLs = async (tourId) => {
      setBaseId(tourId);
      setIsShowImagesURLsModal(true);
      fetchImagesURLs(tourId);
   };

   const handleCloseImagesURLsModal = () => {
      setIsShowImagesURLsModal(false);
      setImagesURLs([]);
      setBaseId(null);
   };

   const fetchImagesURLs = async (tourId) => {
      setIsImageLoading(true);
      try {
         const response = await getAllImagesUrlsByTourId(tourId);
         setImagesURLs(response.data);
      } catch (error) {
         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsImageLoading(false);
      }
   };

   const columnsImage = [
      {
         title: "Hình ảnh",
         dataIndex: "url",
         key: "url",
         render: (_, image) => (
            <Image
               style={{
                  objectFit: "cover", // Giữ tỉ lệ ảnh và không bị cắt bớt
               }}
               height={100}
               width={100}
               src={image.url}
            />
         ),
      },
      {
         title: "Urls hình ảnh",
         key: "url",
         render: (_, image) => (
            <p title={image.url} className="format">
               {image.url}
            </p>
         ),
      },
      {
         title: "Action",
         key: "action",
         render: (_, image) => (
            <div className="flex gap-2 items-center">
               <Button
                  onClick={() => handleShowModalDeleteImage(image.id)}
                  size="large"
                  type="primary"
                  danger
                  ghost
               >
                  Xóa
               </Button>
               <Button
                  onClick={() => handleShowUpdateImageModal(image)}
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

   const dataImage = imagesURLs?.map((image) => {
      return {
         id: image.id,
         key: image.id,
         url: image.url,
      };
   });

   // Mở modal thêm hình ảnh
   const handleShowAddImageModal = () => {
      setIsShowAddImageModal(true);
   };

   // Ẩn modal thêm hình ảnh
   const handleCloseAddImageModal = () => {
      setIsShowAddImageModal(false);
      formAddImages.resetFields();
      setValueImageAddImage([""]);
   };

   // Xác nhận thêm hình ảnh
   const onFinishAddImages = async (values) => {
      try {
         setIsAddImageLoading(true);
         const response = await createImagesForTour(baseId, values);
         console.log("response: ", response);
         if (response.status === 200) {
            message.success("Thêm hình ảnh thành công!");
         } else {
            message.error("Thêm hình ảnh thất bại, vui lòng thử lại!");
            return;
         }
         fetchImagesURLs(baseId);
         handleCloseAddImageModal();
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsAddImageLoading(false);
      }
   };

   // Mở modal cập nhật hình ảnh
   const handleShowUpdateImageModal = (image) => {
      setIsShowUpdateImageModal(true);
      setBaseImageId(image.id);
      setValueImageUpdateImage(image.url);
      formUpdateImage.setFieldsValue({
         image: image.url,
      });
      setTimeout(() => {
         if (updateImage.current) {
            updateImage.current.focus();
         }
      }, 100);
   };

   // Ẩn modal cập nhật hình ảnh
   const handleCloseUpdateImageModal = () => {
      setIsShowUpdateImageModal(false);
      setBaseImageId(null);
      setValueImageUpdateImage("");
      formUpdateImage.resetFields();
   };

   // Xác nhận cập nhật hình ảnh
   const onFinishUpdateImage = async (values) => {
      try {
         setIsUpdateImageLoading(true);
         const response = await updateImagesForTour(
            baseId,
            baseImageId,
            values
         );
         console.log("response: ", response);
         if (response.status === 200) {
            message.success("Cập nhật hình ảnh thành công!");
         } else {
            message.error("Cập nhật hình ảnh thất bại, vui lòng thử lại!");
            return;
         }
         fetchImagesURLs(baseId);
         handleCloseUpdateImageModal();
      } catch (error) {
         console.log("error: ", error);
         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsUpdateImageLoading(false);
      }
   };

   // Mở modal xóa hình ảnh
   const handleShowModalDeleteImage = (imageId) => {
      setIsShowImageModalDelete(true);
      setBaseImageId(imageId);
   };

   // Ẩn modal xóa hình ảnh
   const handleCloseModalDeleteImage = () => {
      setIsShowImageModalDelete(false);
      setBaseImageId(null);
   };

   const handleConfirmDeleteImage = async () => {
      try {
         setIsDeleteImageLoading(true);
         // Gọi API xóa hình ảnh
         const response = await removeImageByTourIdAndImageId(
            baseId,
            baseImageId
         );

         console.log("response: ", response);

         if (response.status === 200) {
            message.success("Xóa hình ảnh thành công!");
         } else {
            message.error("Xóa hình ảnh thất bại, vui lòng thử lại!");
            return;
         }

         // Cập nhật lại danh sách hình ảnh sau khi xóa
         fetchImagesURLs(baseId);
         handleCloseModalDeleteImage();
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsDeleteImageLoading(false);
      }
   };

   // Lấy ra hình ảnh hiện tại qua baseImageId
   const currentImage = imagesURLs?.find((image) => image.id === baseImageId);

   // lấy ra tour hiện tại qua baseId
   const currentTour = tours?.find((tour) => tour.id === baseId);

   return (
      <>
         {/* ==================================================================================================================== */}
         {/* GIAO DIỆN CỦA HÌNH ẢNH */}
         {/* ==================================================================================================================== */}

         {/* Giao diện xem hình ảnh */}
         <Modal
            onCancel={handleCloseImagesURLsModal}
            title={
               <div className="flex items-center gap-2">
                  <p>Hình ảnh của</p>
                  <p className="text-[#efb748]">{currentTour?.tourName}</p>
               </div>
            }
            width={1500}
            open={isShowImagesURLsModal}
            footer={false}
         >
            <div className="flex justify-end mb-4">
               <Button
                  onClick={handleShowAddImageModal}
                  type="primary"
                  size="large"
               >
                  Thêm hình ảnh
               </Button>
            </div>
            <Table
               loading={isImageLoading}
               columns={columnsImage}
               dataSource={dataImage}
            />
         </Modal>

         {/* Giao diện thêm hình ảnh */}
         <Modal
            title="Thêm ảnh"
            onCancel={handleCloseAddImageModal}
            open={isShowAddImageModal}
            footer={false}
         >
            <Form
               form={formAddImages}
               name="add-or-update-images"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinishAddImages}
               autoComplete="off"
               requiredMark={false}
            >
               {/* Hình ảnh */}
               <Form.List
                  name="images"
                  rules={[
                     {
                        // Đảm bảo ít nhất một hình ảnh được nhập
                        validator: async (_, images) => {
                           if (!images || images.length === 0) {
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

                        {fields.map((field, index) => {
                           // Tách key ra, giữ lại các thuộc tính còn lại
                           const { key, ...restField } = field;
                           console.log(fields);

                           return (
                              <Space
                                 key={key} // KEY đúng chỗ
                                 style={{ display: "flex", marginBottom: 8 }}
                                 align="start"
                              >
                                 <div
                                    className="flex items-center justify-center gap-4 p-3 border rounded-md shadow-sm"
                                    style={{ flexGrow: 1 }}
                                 >
                                    <Form.Item
                                       {...restField}
                                       rules={[
                                          {
                                             required: true,
                                             message:
                                                "URL hình ảnh không được trống",
                                          },
                                       ]}
                                       style={{ flexGrow: 1, marginBottom: 0 }}
                                    >
                                       <Input
                                          className="w-full"
                                          placeholder={`URL hình ảnh ${
                                             index + 1
                                          }`}
                                       />
                                    </Form.Item>

                                    <Image
                                       width={100}
                                       height={100}
                                       preview={false}
                                       style={{ objectFit: "cover" }}
                                       src={debounceValueImageAddImage[index]}
                                    />
                                 </div>

                                 {/* Nút Xóa */}
                                 <MinusCircleOutlined
                                    onClick={() => remove(field.name)}
                                    style={{
                                       marginTop: "8px",
                                       cursor: "pointer",
                                    }}
                                 />
                              </Space>
                           );
                        })}

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

               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseImagesURLsModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isAddImageLoading}
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

         {/* Giao diện cập hình ảnh */}
         <Modal
            title="Cập nhật hình ảnh"
            onCancel={handleCloseUpdateImageModal}
            open={isShowUpdateImageModal}
            footer={false}
         >
            <Form
               form={formUpdateImage}
               name="update-images"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinishUpdateImage}
               autoComplete="off"
               requiredMark={false}
            >
               <div className="flex items-center justify-between gap-4 mt-5">
                  <Form.Item
                     name="image"
                     rules={[
                        {
                           required: true,
                           message: "URL hình ảnh không được trống",
                        },
                     ]}
                  >
                     <Input
                        onChange={(e) =>
                           setValueImageUpdateImage(e.target.value)
                        }
                        ref={updateImage}
                        className="w-full"
                        placeholder={`URL hình ảnh`}
                     />
                  </Form.Item>
                  <Form.Item>
                     <Image
                        style={{ objectFit: "cover" }}
                        height={200}
                        width={200}
                        preview={false}
                        src={debounceValueImageUpdateImage}
                     />
                  </Form.Item>
               </div>
               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseUpdateImageModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        // loading={isAddImageLoading}
                        color="primary"
                        variant="outlined"
                        size="large"
                        htmlType="submit"
                     >
                        Cập nhật
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện xóa hình ảnh */}
         <Modal
            title="Xóa hình ảnh"
            open={isShowImageModalDelete}
            onCancel={handleCloseModalDeleteImage}
            footer={
               <div className="flex justify-end items-center gap-2">
                  <Button
                     onClick={handleCloseModalDeleteImage}
                     size="large"
                     type="primary"
                     ghost
                  >
                     Hủy
                  </Button>
                  <Button
                     onClick={handleConfirmDeleteImage}
                     loading={isDeleteImageLoading}
                     size="large"
                     type="primary"
                     danger
                     ghost
                  >
                     Xóa
                  </Button>
               </div>
            }
         >
            <Image
               style={{
                  objectFit: "cover",
               }}
               preview={false}
               width={200}
               height={200}
               src={currentImage?.url}
            />
         </Modal>

         {/* ==================================================================================================================== */}
         {/* GIAO DIỆN CỦA TOUR */}
         {/* ==================================================================================================================== */}

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
                           if (!images || images.length === 0) {
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

                        {fields.map((field, index) => {
                           // Tách key ra, giữ lại các thuộc tính còn lại
                           const { key, ...restField } = field;
                           console.log(fields);

                           return (
                              <Space
                                 key={key} // KEY đúng chỗ
                                 style={{ display: "flex", marginBottom: 8 }}
                                 align="start"
                              >
                                 <div
                                    className="flex items-center justify-center gap-4 p-3 border rounded-md shadow-sm"
                                    style={{ flexGrow: 1 }}
                                 >
                                    <Form.Item
                                       {...restField}
                                       rules={[
                                          {
                                             required: true,
                                             message:
                                                "URL hình ảnh không được trống",
                                          },
                                       ]}
                                       style={{ flexGrow: 1, marginBottom: 0 }}
                                    >
                                       <Input
                                          className="w-full"
                                          placeholder={`URL hình ảnh ${
                                             index + 1
                                          }`}
                                       />
                                    </Form.Item>

                                    <Image
                                       width={100}
                                       height={100}
                                       preview={false}
                                       style={{ objectFit: "cover" }}
                                       src={debounceValueImageAddTour[index]}
                                    />
                                 </div>

                                 {/* Nút Xóa */}
                                 <MinusCircleOutlined
                                    onClick={() => remove(field.name)}
                                    style={{
                                       marginTop: "8px",
                                       cursor: "pointer",
                                    }}
                                 />
                              </Space>
                           );
                        })}

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
               <p>Khu vực</p>
               <Select
                  defaultValue="all"
                  onChange={(value) => {
                     setCheckAreaId(value); // Cập nhật trạng thái
                     setCurrentPage(1); // RESET VỀ TRANG 1
                  }} // Cập nhật thể loại
                  style={{ width: 160 }}
                  options={[
                     {
                        value: "all",
                        label: "Tất cả",
                     },

                     ...areas
                        ?.filter((area) => area.status === true)
                        .map((area) => ({
                           value: area.id,
                           label: area.areaName,
                        })),
                  ]}
               />
            </div>
            <div>
               <Input.Search
                  loading={isTourLoading}
                  placeholder="Tìm kiếm chuyến đi"
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

         {/* Giao diện bảng dữ liệu chuyến đi */}
         <div className="mb-4">
            <Table
               loading={isTourLoading}
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
