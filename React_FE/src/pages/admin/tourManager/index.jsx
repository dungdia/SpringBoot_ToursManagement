import { getAllAreasNotFilter } from "@/services/areaService";
import {
   createDayDetailForTour,
   createImagesForTour,
   createTour,
   getAllDayDetailsByTourIdNotPage,
   getAllDayDetailsByTourIdWithFilterPage,
   getAllImagesUrlsByTourIdWithPage,
   getAllTours,
   removeDayDetailByTourIdAndDayDetailId,
   removeImageByTourIdAndImageId,
   unblockStatusDayDetail,
   updateDayDetailByTourIdAndDayDetailId,
   updateImagesForTour,
} from "@/services/tourService";
import {
   formatMoney,
   vietnameseCurrencyFormatter,
   vietnameseCurrencyParser,
} from "@/utils/vaidate";
import {
   MinusCircleOutlined,
   PlusOutlined,
   TagsOutlined,
} from "@ant-design/icons";
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
   Tag,
} from "antd";
import { HttpStatusCode } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./tourManager.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(advancedFormat);

import { useDebounce } from "@/hooks/useDebounce";

export default function TourManager() {
   // Formatter cho ngày
   const DATETIME_FORMAT = "DD-MM-YYYY HH:mm:ss";
   // Hàm validation cho ngày quá khứ
   const disabledPastDate = (current) => {
      // Chỉ chọn ngày từ ngày hiện tại trở đi
      return current && current < dayjs().startOf("day");
   };
   // Hàm validation cho ngày đến phải sau ngày từ
   const disabledDateTo = (current, dateFrom) => {
      if (!dateFrom) {
         // Nếu ngày từ chưa được chọn, không áp dụng giới hạn này
         return false;
      }

      return current.isBefore(dateFrom, "day");
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

   // Phân trang hình ảnh
   const [imageTotalElements, setImageTotalElements] = useState(0);
   const [imageCurrentPage, setImageCurrentPage] = useState(0);
   const [imagePageSize, setImagePageSize] = useState(4);

   // Cho form thêm hình ảnh
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

   // Giao diện xem lịch trình ================================================================================================
   const [isShowDayDetailsModal, setIsShowDayDetailsModal] = useState(false);
   const [dayDetails, setDayDetails] = useState([]);
   const [isDayDetailLoading, setIsDayDetailLoading] = useState(false);

   // Phân trang lịch trình
   const [dayDetailTotalElements, setDayDetailTotalElements] = useState(0);
   const [dayDetailCurrentPage, setDayDetailCurrentPage] = useState(0);
   const [dayDetailPageSize, setDayDetailPageSize] = useState(5);
   const [searchDayDetailValue, setSearchDayDetailValue] = useState("");
   const [checkStatusDayDetail, setCheckStatusDayDetail] = useState("all");
   const [valueDepartureDateFrom, setValueDepartureDateFrom] = useState(null);
   const [valueDepartureDateTo, setValueDepartureDateTo] = useState(null);
   const [valueReturnDateFrom, setValueReturnDateFrom] = useState(null);
   const [valueReturnDateTo, setValueReturnDateTo] = useState(null);

   // Cho form thêm lịch trình
   const [formAddDayDetail] = Form.useForm();
   const [isShowAddDayDetailModal, setIsShowAddDayDetailModal] =
      useState(false);
   const [isAddDayDetailLoading, setIsAddDayDetailLoading] = useState(false);

   // lấy id lịch trình cơ sở
   const [baseDayDetailId, setBaseDayDetailId] = useState(null);

   // Modal xóa lịch trình
   const [formDeleteDayDetail] = Form.useForm();
   const [isShowDayDetailModalDelete, setIsShowDayDetailModalDelete] =
      useState(false);
   const [isDeleteDayDetailLoading, setIsDeleteDayDetailLoading] =
      useState(false);

   // Modal mở lịch trình
   const [formOpenBlockDayDetail] = Form.useForm();
   const [isShowDayDetailModalOpenBlock, setIsShowDayDetailModalOpenBlock] =
      useState(false);
   const [isOpenBlockDayDetailLoading, setIsOpenBlockDayDetailLoading] =
      useState(false);

   // Cho form câp nhật ảnh
   const updateDayDetail = useRef();
   const [formUpdateDayDetail] = Form.useForm();
   const [isShowUpdateDayDetailModal, setIsShowUpdateDayDetailModal] =
      useState(false);
   const [isUpdateDayDetailLoading, setIsUpdateDayDetailLoading] =
      useState(false);

   // ====================================================================================================================================
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
         render: (_, tour) => (
            <Button
               onClick={() => handleShowDayDetails(tour.id)}
               color="purple"
               variant="solid"
               size="large"
            >
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
   }, [fetchTours]);

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

   // Hiển thị modal xem hình ảnh
   const handleShowImagesURLs = async (tourId) => {
      setBaseId(tourId);
      setIsShowImagesURLsModal(true);
      fetchImagesURLs(tourId);
   };

   // Ẩn modal xem hình ảnh
   const handleCloseImagesURLsModal = () => {
      setIsShowImagesURLsModal(false);
      setImagesURLs([]);
      setBaseId(null);
   };

   // Lấy ra hình ảnh theo tourId với phân trang
   const fetchImagesURLs = useCallback(
      async (tourId) => {
         setIsImageLoading(true);
         try {
            const pageIndex = imageCurrentPage - 1;
            const response = await getAllImagesUrlsByTourIdWithPage(
               tourId,
               pageIndex,
               imagePageSize
            );
            console.log(response);

            setImagesURLs(response.data.content);
            setImageTotalElements(response.data.totalElements);
         } catch (error) {
            if (error.response?.status === HttpStatusCode.BadRequest) {
               message.error(error.response.data);
            } else {
               message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
            }
         } finally {
            setIsImageLoading(false);
         }
      },
      [imageCurrentPage, imagePageSize]
   );

   // Tự động gọi hàm fetchImagesURLs khi baseId, imageCurrentPage, imagePageSize thay đổi
   useEffect(() => {
      if (baseId && isShowImagesURLsModal) {
         fetchImagesURLs(baseId);
      }
   }, [fetchImagesURLs]);

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

   // Xác nhận xóa hình ảnh
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
         setImageCurrentPage(1);
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsDeleteImageLoading(false);
         // Cập nhật lại danh sách hình ảnh sau khi xóa
         fetchImagesURLs(baseId);
         handleCloseModalDeleteImage();
      }
   };

   // Hàm chuyển trang hình ảnh
   const handleChangeImagePage = (imageCurrentPage, imagePageSize) => {
      // Cập nhật lại trang hiện tại
      setImageCurrentPage(imageCurrentPage);

      // cập nhật số lượng bảng ghi / trang
      setImagePageSize(imagePageSize);
   };

   // Lấy ra hình ảnh hiện tại qua baseImageId
   const currentImage = imagesURLs?.find((image) => image.id === baseImageId);

   // =====================================================================================================================
   // GIAO DIỆN XEM LICH TRÌNH
   // =====================================================================================================================

   // Hiển thị modal xem lịch trình
   const handleShowDayDetails = async (tourId) => {
      setBaseId(tourId);
      setIsShowDayDetailsModal(true);
      fetchDayDetails(tourId);
   };

   // Ẩn modal xem lịch trình
   const handleCloseDayDetailsModal = () => {
      setIsShowDayDetailsModal(false);
      setDayDetails([]);
      setBaseId(null);
      setValueDepartureDateFrom(null);
      setValueDepartureDateTo(null);
      setValueReturnDateFrom(null);
      setValueReturnDateTo(null);
   };

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceDayDetailSearch = useDebounce(searchDayDetailValue, 800);

   // Lấy ra lịch trình theo tourId
   const fetchDayDetails = useCallback(
      async (tourId) => {
         setIsDayDetailLoading(true);
         try {
            const pageIndex = dayDetailCurrentPage - 1;

            const statusParam =
               checkStatusDayDetail === "all" ? null : checkStatusDayDetail;

            const departureDateFrom =
               valueDepartureDateFrom !== null
                  ? valueDepartureDateFrom.format(DATETIME_FORMAT)
                  : null;

            const departureDateTo =
               valueDepartureDateTo !== null
                  ? valueDepartureDateTo.format(DATETIME_FORMAT)
                  : null;
            const returnDateFrom =
               valueReturnDateFrom != null
                  ? valueReturnDateFrom.format(DATETIME_FORMAT)
                  : null;
            const returnDateTo =
               valueReturnDateTo !== null
                  ? valueReturnDateTo.format(DATETIME_FORMAT)
                  : null;

            const response = await getAllDayDetailsByTourIdWithFilterPage(
               tourId,
               debounceDayDetailSearch,
               statusParam,
               departureDateFrom,
               departureDateTo,
               returnDateFrom,
               returnDateTo,
               pageIndex,
               dayDetailPageSize
            );

            setDayDetails(response.data.content);
            setDayDetailTotalElements(response.data.totalElements);
         } catch (error) {
            console.log("error: ", error);
            if (error.response?.status === HttpStatusCode.BadRequest) {
               message.error(error.response.data);
            } else {
               message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
            }
         } finally {
            setIsDayDetailLoading(false);
         }
      },
      [
         debounceDayDetailSearch,
         checkStatusDayDetail,
         valueDepartureDateFrom,
         valueDepartureDateTo,
         valueReturnDateFrom,
         valueReturnDateTo,
         dayDetailCurrentPage,
         dayDetailPageSize,
      ]
   );

   // Tự động gọi hàm fetchDayDetails khi baseId, dayDetailCurrentPage, dayDetailPageSize thay đổi
   useEffect(() => {
      if (baseId && isShowDayDetailsModal) {
         fetchDayDetails(baseId);
      }
   }, [fetchDayDetails]);

   const columnsDayDetail = [
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
         title: "Đã đặt",
         key: "isBooked",
         dataIndex: "isBooked",
         render: (_, detail) => (
            <p
               className={
                  detail.isBooked
                     ? "font-semibold text-[#ff8904]"
                     : "font-semibold text-[#722ed1]"
               }
            >
               {detail.isBooked ? "Có người đặt" : "Chưa ai đặt"}
            </p>
         ),
      },
      {
         title: "Giá tiền",
         key: "price",
         dataIndex: "price",
         render: (_, detail) => (
            <p title={detail.price} className="text-green-500 format">
               {formatMoney(detail.price)}
            </p>
         ),
      },
      {
         title: "Trạng thái",
         key: "status",
         dataIndex: "status",
         render: (_, detail) => (
            <p
               className={
                  detail.status
                     ? "font-semibold text-green-400"
                     : "font-semibold text-red-400"
               }
            >
               {detail.status ? "Hoạt động" : "Không hoạt động"}
            </p>
         ),
      },
      {
         title: "Hành động",
         key: "action",
         render: (_, detail) => {
            return (
               <div className="flex gap-2 items-center">
                  {/* NÚT KHÓA / XÓA*/}
                  {
                     <Button
                        onClick={() => handleShowModalDeleteDayDetail(detail)}
                        size="large"
                        type="primary"
                        danger
                        ghost
                        style={{
                           color: detail.status ? "#efb748" : "",
                           borderColor: detail.status ? "#efb748" : "",
                        }}
                     >
                        {detail.status ? "Khóa" : "Xóa"}
                     </Button>
                  }

                  {/* NÚT MỞ KHÓA*/}
                  {!detail.status && (
                     <Button
                        size="large"
                        onClick={() =>
                           handleShowModalOpenBlockDayDetail(detail)
                        }
                        color="cyan"
                        variant="solid"
                     >
                        Mở
                     </Button>
                  )}

                  {/* NÚT SỬA*/}
                  {
                     <Button
                        size="large"
                        onClick={() => handleShowUpdateDayDetailModal(detail)}
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

   const dataDayDetail = dayDetails?.map((detail) => {
      return {
         id: detail.id,
         key: detail.id,
         departureDate: detail.departureDate,
         returnDate: detail.returnDate,
         slot: detail.slot,
         isBooked: detail.isBooked,
         price: detail.price,
         status: detail.status,
      };
   });

   // Mở modal thêm lịch trình
   const handleShowAddDayDetailModal = () => {
      setIsShowAddDayDetailModal(true);
   };

   // Ẩn modal thêm lịch trình
   const handleCloseAddDayDetailModal = () => {
      setIsShowAddDayDetailModal(false);
      formAddDayDetail.resetFields();
   };

   // Xác nhận thêm lịch trình
   const onFinishAddDayDetail = async (values) => {
      setIsAddDayDetailLoading(true);
      try {
         const processedValues = { ...values };
         if (
            processedValues.dayDetails &&
            processedValues.dayDetails.length > 0
         ) {
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
         const response = await createDayDetailForTour(baseId, processedValues);
         if (response.status === 200) {
            message.success("Thêm lịch trình thành công!");
         } else {
            message.error("Thêm hình ảnh thất bại, vui lòng thử lại!");
            return;
         }
         fetchDayDetails(baseId);
         handleCloseAddDayDetailModal();
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsAddDayDetailLoading(false);
      }
   };

   // Mở modal xóa lịch trình
   const handleShowModalDeleteDayDetail = (detail) => {
      setIsShowDayDetailModalDelete(true);
      setBaseDayDetailId(detail?.id);

      const departureDateValue =
         detail?.departureDate && detail.departureDate !== ""
            ? dayjs(detail.departureDate, DATETIME_FORMAT)
            : null;

      const returnDateValue =
         detail?.returnDate && detail.returnDate !== ""
            ? dayjs(detail.returnDate, DATETIME_FORMAT)
            : null;

      formDeleteDayDetail.setFieldsValue({
         departureDate: departureDateValue,
         returnDate: returnDateValue,
         slot: detail?.slot ? Number(detail.slot) : null,
         price: detail?.price ? Number(detail.price) : null,
      });
   };

   // Ẩn modal xóa lịch trình
   const handleCloseModalDeleteDayDetail = () => {
      setIsShowDayDetailModalDelete(false);
      setBaseDayDetailId(null);
      formDeleteDayDetail.resetFields();
   };

   // Xác nhận xóa lịch trình
   const handleConfirmDeleteDayDetail = async () => {
      try {
         setIsDeleteDayDetailLoading(true);
         // Gọi API xóa lịch trình
         const response = await removeDayDetailByTourIdAndDayDetailId(
            baseId,
            baseDayDetailId
         );

         console.log("response: ", response);

         if (response.status === 200) {
            message.success(response.data);
         } else {
            message.error("Xóa lịch trình thất bại, vui lòng thử lại!");
            return;
         }

         setDayDetailCurrentPage(1);
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.warning(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsDeleteDayDetailLoading(false);
         // Cập nhật lại danh sách lịch trình sau khi xóa
         fetchDayDetails(baseId);
         handleCloseModalDeleteDayDetail();
      }
   };

   // Mở modal mở khóa lịch trình
   const handleShowModalOpenBlockDayDetail = (detail) => {
      setIsShowDayDetailModalOpenBlock(true);
      setBaseDayDetailId(detail?.id);

      const departureDateValue =
         detail?.departureDate && detail.departureDate !== ""
            ? dayjs(detail.departureDate, DATETIME_FORMAT)
            : null;

      const returnDateValue =
         detail?.returnDate && detail.returnDate !== ""
            ? dayjs(detail.returnDate, DATETIME_FORMAT)
            : null;

      formOpenBlockDayDetail.setFieldsValue({
         departureDate: departureDateValue,
         returnDate: returnDateValue,
         slot: detail?.slot ? Number(detail.slot) : null,
         price: detail?.price ? Number(detail.price) : null,
      });
   };

   // Ẩn modal mở khóa lịch trình
   const handleCloseModalOpenBlockDayDetail = () => {
      setIsShowDayDetailModalOpenBlock(false);
      setBaseDayDetailId(null);
      formOpenBlockDayDetail.resetFields();
   };

   // Xác nhận mở khóa lịch trình
   const handleConfirmOpenBlockDayDetail = async () => {
      try {
         setIsOpenBlockDayDetailLoading(true);
         // Gọi API xóa lịch trình
         const response = await unblockStatusDayDetail(baseId, baseDayDetailId);

         console.log("response: ", response);

         if (response.status === 200) {
            message.success(response.data);
         } else {
            message.error("Xóa lịch trình thất bại, vui lòng thử lại!");
            return;
         }

         setDayDetailCurrentPage(1);
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            message.warning(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsOpenBlockDayDetailLoading(false);
         // Cập nhật lại danh sách lịch trình sau khi xóa
         fetchDayDetails(baseId);
         handleCloseModalOpenBlockDayDetail();
      }
   };

   // Mở modal cập nhật lịch trình
   const handleShowUpdateDayDetailModal = (detail) => {
      setIsShowUpdateDayDetailModal(true);
      setBaseDayDetailId(detail.id);
      const departureDateValue =
         detail?.departureDate && detail.departureDate !== ""
            ? dayjs(detail.departureDate, DATETIME_FORMAT)
            : null;

      const returnDateValue =
         detail?.returnDate && detail.returnDate !== ""
            ? dayjs(detail.returnDate, DATETIME_FORMAT)
            : null;

      formUpdateDayDetail.setFieldsValue({
         dayDetail: {
            departureDate: departureDateValue,
            returnDate: returnDateValue,
            slot: detail?.slot ? Number(detail.slot) : null,
            price: detail?.price ? Number(detail.price) : null,
            status: detail?.status ? true : false,
         },
      });
   };

   // Ẩn modal cập nhật lịch trình
   const handleCloseUpdateDayDetailModal = () => {
      setIsShowUpdateDayDetailModal(false);
      setBaseDayDetailId(null);
      formUpdateDayDetail.resetFields();
   };

   const onFinishUpdateDayDetail = async (values) => {
      setIsUpdateDayDetailLoading(true);
      const processedData = { ...values };

      try {
         if (processedData.dayDetail) {
            const dayDetail = processedData.dayDetail;

            dayDetail.departureDate = dayDetail.departureDate
               ? dayDetail.departureDate.format(DATETIME_FORMAT)
               : null;

            dayDetail.returnDate = dayDetail.returnDate
               ? dayDetail.returnDate.format(DATETIME_FORMAT)
               : null;
         }

         console.log("processedData: ", processedData);

         const response = await updateDayDetailByTourIdAndDayDetailId(
            baseId,
            baseDayDetailId,
            processedData
         );

         console.log("response: ", response);

         if (response.status === 200) {
            message.success("Cập nhật lịch trình thành công!");
         } else {
            // Xử lý các mã lỗi khác ngoài 400
            message.error("Cập nhật lịch trình thất bại, vui lòng thử lại!");
            return;
         }

         // 4. Cập nhật giao diện và đóng Modal
         fetchDayDetails(baseId);
         handleCloseUpdateDayDetailModal();
      } catch (error) {
         console.log("error: ", error);

         if (error.response?.status === HttpStatusCode.BadRequest) {
            // Xử lý lỗi validation từ server
            message.error(error.response.data);
         } else {
            message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
         }
      } finally {
         setIsUpdateDayDetailLoading(false);
      }
   };

   // Hàm chuyển trang lich trình
   const handleChangeDayDetailPage = (
      dayDetailCurrentPage,
      dayDetailPageSize
   ) => {
      // Cập nhật lại trang hiện tại
      setDayDetailCurrentPage(dayDetailCurrentPage);

      // cập nhật số lượng bảng ghi / trang
      setDayDetailPageSize(dayDetailPageSize);
   };

   // lấy ra lịch trình hiện tại qua baseDayDetailId
   const currentDayDetail = dayDetails?.find(
      (detail) => detail.id === baseDayDetailId
   );

   // lấy ra tour hiện tại qua baseId
   const currentTour = tours?.find((tour) => tour.id === baseId);

   return (
      <>
         {/* ==================================================================================================================== */}
         {/* GIAO DIỆN CỦA LỊCH TRÌNH */}
         {/* ==================================================================================================================== */}

         {/* Giao diện lịch trình */}
         <Modal
            title={
               <div className="flex items-center gap-2">
                  <p>Lịch trình của chuyến</p>
                  <p className="text-[#efb748] format">
                     {currentTour?.tourName}
                  </p>
               </div>
            }
            onCancel={handleCloseDayDetailsModal}
            width={1500}
            footer={false}
            open={isShowDayDetailsModal}
         >
            {/* Giao diện tìm kiếm header của lịch trình */}
            <div className="flex justify-between mb-4 mt-4">
               <div className="flex-col items-center gap-3">
                  <div
                     id="search-tour"
                     className="flex gap-5 items-center justify-start mb-3"
                  >
                     <div className="flex gap-2 items-center">
                        <p>Trạng thái</p>
                        <Select
                           defaultValue="all"
                           onChange={(value) => {
                              setCheckStatusDayDetail(value); // Cập nhật trạng thái
                              setDayDetailCurrentPage(1); // RESET VỀ TRANG 1
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
                     <div>
                        <Input.Search
                           loading={isDayDetailLoading}
                           placeholder="Tìm kiếm số chỗ hoặc tiền"
                           className="w-[350px]"
                           allowClear
                           value={searchDayDetailValue}
                           onChange={(e) => {
                              setSearchDayDetailValue(e.target.value);
                              if (searchDayDetailValue != null)
                                 setDayDetailCurrentPage(1);
                           }}
                        />
                     </div>
                  </div>
                  <div className="flex items-center gap-20">
                     <div className="flex items-center gap-2">
                        <p>Ngày khởi hành</p>
                        <DatePicker
                           placeholder="Ngày khởi hành từ"
                           showTime={{ format: "HH:mm:ss" }} // Hiển thị chọn giờ/phút/giây
                           format={DATETIME_FORMAT} // Định dạng đầu ra/hiển thị
                           value={valueDepartureDateFrom} // Gắn giá trị
                           onChange={(date) => {
                              setValueDepartureDateFrom(date);
                              setDayDetailCurrentPage(1); // RESET VỀ TRANG 1

                              // Nếu Ngày Khởi hành Từ bị xóa, thì reset luôn cả Ngày Khởi hành Đến, Ngày Trở về Từ, Ngày Trở về Đến
                              if (!date) {
                                 setValueDepartureDateTo(null);
                                 setValueReturnDateFrom(null);
                                 setValueReturnDateTo(null);
                              }
                           }} // Cập nhật state
                        />
                        <DatePicker
                           showTime={{ format: "HH:mm:ss" }} // Hiển thị chọn giờ/phút/giây
                           format={DATETIME_FORMAT} // Định dạng đầu ra/hiển thị
                           placeholder="Ngày khởi hành đến"
                           value={valueDepartureDateTo} // Gắn giá trị
                           onChange={(date) => {
                              setValueDepartureDateTo(date);
                              setDayDetailCurrentPage(1); // RESET VỀ TRANG 1

                              // Nếu Ngày Khởi hành Đến bị xóa, thì reset luôn cả Ngày Trở về Từ, Ngày Trở về Đến
                              if (!date) {
                                 setValueReturnDateFrom(null);
                                 setValueReturnDateTo(null);
                              }
                           }} // Cập nhật state
                           // Chỉ được chọn khi Departure From đã có
                           disabled={!valueDepartureDateFrom}
                           // Ngày đến phải sau hoặc bằng Ngày từ
                           disabledDate={(current) =>
                              disabledDateTo(current, valueDepartureDateFrom)
                           }
                        />
                     </div>

                     <div className="flex items-center gap-2">
                        <p>Ngày trở về</p>
                        <DatePicker
                           placeholder="Ngày trở về từ"
                           showTime={{ format: "HH:mm:ss" }} // Hiển thị chọn giờ/phút/giây
                           format={DATETIME_FORMAT} // Định dạng đầu ra/hiển thị
                           value={valueReturnDateFrom} // Gắn giá trị
                           onChange={(date) => {
                              setValueReturnDateFrom(date);
                              setDayDetailCurrentPage(1); // RESET VỀ TRANG 1

                              // Nếu Ngày Trở về Từ bị xóa, thì reset luôn cả Ngày Trở về Đến
                              if (!date) {
                                 setValueReturnDateTo(null);
                              }
                           }} // Cập nhật state
                           // Chỉ được chọn khi Departure To đã có
                           disabled={!valueDepartureDateTo}
                           // Ngày trở về từ phải sau hoặc bằng Ngày khởi hành đến
                           disabledDate={(current) =>
                              disabledDateTo(current, valueDepartureDateTo)
                           }
                        />
                        <DatePicker
                           placeholder="Ngày trở về đến"
                           showTime={{ format: "HH:mm:ss" }} // Hiển thị chọn giờ/phút/giây
                           format={DATETIME_FORMAT} // Định dạng đầu ra/hiển thị
                           value={valueReturnDateTo} // Gắn giá trị
                           onChange={(date) => {
                              setValueReturnDateTo(date);
                              setDayDetailCurrentPage(1); // RESET VỀ TRANG 1
                           }} // Cập nhật state
                           // Chỉ được chọn khi Return From đã có
                           disabled={!valueReturnDateFrom}
                           // Ngày đến phải sau hoặc bằng Ngày từ (Return From)
                           disabledDate={(current) =>
                              disabledDateTo(current, valueReturnDateFrom)
                           }
                        />
                     </div>
                  </div>
               </div>
               <div>
                  <Button
                     onClick={handleShowAddDayDetailModal}
                     type="primary"
                     size="large"
                  >
                     Thêm lịch trình
                  </Button>
               </div>
            </div>

            {/* Giao diện bảng hình */}
            <div>
               <Table
                  pagination={false}
                  loading={isDayDetailLoading}
                  columns={columnsDayDetail}
                  dataSource={dataDayDetail}
               />
            </div>

            {/* Giao diện của phân lịch trình */}
            <div className="flex items-center justify-end mt-4">
               {dayDetailTotalElements <= 5 ? (
                  ""
               ) : (
                  <div className="page">
                     <Pagination
                        showSizeChanger
                        total={dayDetailTotalElements}
                        showTotal={(total, range) =>
                           `${range[0]}-${range[1]} of ${total} items`
                        }
                        onChange={handleChangeDayDetailPage}
                        defaultPageSize={dayDetailPageSize}
                        current={dayDetailCurrentPage}
                        pageSizeOptions={[5, 10, 20, 50, 100]}
                     />
                  </div>
               )}
            </div>
         </Modal>

         {/* Giao diện thêm lịch trình */}
         <Modal
            title={`Thêm lịch trình cho chuyến ${currentTour?.tourName}`}
            onCancel={handleCloseAddDayDetailModal}
            footer={false}
            open={isShowAddDayDetailModal}
         >
            <Form
               form={formAddDayDetail}
               name="add-dayDetails"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinishAddDayDetail}
               autoComplete="off"
               requiredMark={false}
            >
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
                                             formAddDayDetail.getFieldValue([
                                                "dayDetails",
                                                name,
                                                "departureDate",
                                             ]);

                                          if (!value || !departureDate) {
                                             return Promise.resolve(); // Bỏ qua nếu một trong hai chưa được chọn (required đã xử lý)
                                          }

                                          // So sánh ngày trở về (value) phải sau hoặc bằng ngày khởi hành (departureDate)
                                          if (
                                             value.isSameOrBefore(departureDate)
                                          ) {
                                             return Promise.reject(
                                                new Error(
                                                   "Ngày trở về phải sau ngày khởi hành!"
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

               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseAddDayDetailModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isAddDayDetailLoading}
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

         {/* Giao diện xóa lịch trình */}
         <Modal
            open={isShowDayDetailModalDelete}
            onCancel={handleCloseModalDeleteDayDetail}
            title={
               currentDayDetail?.status ? "Khóa lịch trình" : "Xóa lịch trình"
            }
            footer={
               <div className="flex justify-end items-center gap-2">
                  <Button
                     onClick={handleCloseModalDeleteDayDetail}
                     size="large"
                     type="primary"
                     ghost
                  >
                     Hủy
                  </Button>
                  <Button
                     size="large"
                     onClick={handleConfirmDeleteDayDetail}
                     loading={isDeleteDayDetailLoading}
                     type="primary" // Cho nút xóa full đỏ
                     danger={!currentDayDetail?.status}
                     style={{
                        backgroundColor: currentDayDetail?.status
                           ? "#efb748"
                           : undefined,
                        color: currentDayDetail?.status ? "#fff" : undefined, // Màu chữ cho nút "Khóa"
                        borderColor: currentDayDetail?.status
                           ? "#efb748"
                           : undefined, // Màu viền cho nút "Khóa"
                     }}
                  >
                     {currentDayDetail?.status ? "Khóa" : "Xóa"}
                  </Button>
               </div>
            }
         >
            <Form
               form={formDeleteDayDetail}
               name="delete-dayDetails"
               style={{ maxWidth: 600 }}
               autoComplete="off"
               requiredMark={false}
            >
               <Form.Item name="departureDate" label="Ngày khởi hành">
                  <DatePicker
                     className="flex"
                     style={{ width: "64%" }}
                     placeholder="Ngày khởi hành"
                     showTime={{ format: "HH:mm:ss" }}
                     format={DATETIME_FORMAT}
                     disabled={true} // Chỉ hiển thị, không cho chỉnh sửa
                  />
               </Form.Item>

               <Form.Item name="returnDate" label="Ngày trở về">
                  <DatePicker
                     className="flex left-6"
                     style={{ width: "60%" }}
                     placeholder="Chọn ngày trở về"
                     showTime={{ format: "HH:mm:ss" }}
                     format={DATETIME_FORMAT}
                     disabled={true}
                  />
               </Form.Item>

               <Form.Item name="slot" label="Số lượng chỗ">
                  <Tag
                     className="text-[15px] flex left-3.5"
                     icon={<TagsOutlined />}
                     color="volcano"
                  >
                     {currentDayDetail?.slot}
                  </Tag>
               </Form.Item>

               <Form.Item name="price" label="Chi phí">
                  <InputNumber
                     className="flex left-13"
                     style={{ width: "56%" }}
                     disabled={true}
                     formatter={vietnameseCurrencyFormatter}
                     parser={vietnameseCurrencyParser}
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện mở khóa lịch trình */}
         <Modal
            open={isShowDayDetailModalOpenBlock}
            onCancel={handleCloseModalOpenBlockDayDetail}
            title="Mở khóa lịch trình"
            footer={
               <div className="flex justify-end items-center gap-2">
                  <Button
                     onClick={handleCloseModalOpenBlockDayDetail}
                     size="large"
                     type="primary"
                     ghost
                  >
                     Hủy
                  </Button>
                  <Button
                     onClick={handleConfirmOpenBlockDayDetail}
                     loading={isOpenBlockDayDetailLoading}
                     size="large"
                     color="cyan"
                     variant="solid"
                  >
                     Mở
                  </Button>
               </div>
            }
         >
            <Form
               form={formOpenBlockDayDetail}
               name="openBlock-dayDetails"
               style={{ maxWidth: 600 }}
               autoComplete="off"
               requiredMark={false}
            >
               <Form.Item name="departureDate" label="Ngày khởi hành">
                  <DatePicker
                     className="flex"
                     style={{ width: "64%" }}
                     placeholder="Ngày khởi hành"
                     showTime={{ format: "HH:mm:ss" }}
                     format={DATETIME_FORMAT}
                     disabled={true} // Chỉ hiển thị, không cho chỉnh sửa
                  />
               </Form.Item>

               <Form.Item name="returnDate" label="Ngày trở về">
                  <DatePicker
                     className="flex left-6"
                     style={{ width: "60%" }}
                     placeholder="Chọn ngày trở về"
                     showTime={{ format: "HH:mm:ss" }}
                     format={DATETIME_FORMAT}
                     disabled={true}
                  />
               </Form.Item>

               <Form.Item name="slot" label="Số lượng chỗ">
                  <Tag
                     className="text-[15px] flex left-3.5"
                     icon={<TagsOutlined />}
                     color="volcano"
                  >
                     {currentDayDetail?.slot}
                  </Tag>
               </Form.Item>

               <Form.Item name="price" label="Chi phí">
                  <InputNumber
                     className="flex left-13"
                     style={{ width: "56%" }}
                     disabled={true}
                     formatter={vietnameseCurrencyFormatter}
                     parser={vietnameseCurrencyParser}
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện cập nhật lịch trình */}
         <Modal
            title="Cập nhật chi tiết ngày"
            onCancel={handleCloseUpdateDayDetailModal}
            open={isShowUpdateDayDetailModal}
            footer={false}
         >
            <Form
               form={formUpdateDayDetail}
               name="update-dayDetail"
               onFinish={onFinishUpdateDayDetail}
               style={{ maxWidth: 600 }}
               autoComplete="off"
               requiredMark={false}
            >
               {/* 1. Ngày khởi hành */}
               <Form.Item
                  name={["dayDetail", "departureDate"]}
                  label="Ngày khởi hành"
                  rules={[
                     {
                        required: true,
                        message: "Ngày khởi hành không để trống",
                     },
                  ]}
               >
                  <DatePicker
                     style={{ width: "65%" }}
                     placeholder="Chọn ngày khởi hành"
                     showTime={{ format: "HH:mm:ss" }}
                     format={DATETIME_FORMAT}
                     disabledDate={disabledPastDate}
                  />
               </Form.Item>

               {/* 2. Ngày trở về */}
               <Form.Item
                  name={["dayDetail", "returnDate"]}
                  label="Ngày trở về"
                  rules={[
                     {
                        required: true,
                        message: "Ngày trở về không để trống",
                     },
                     {
                        validator: (_, value) => {
                           const departureDate =
                              formUpdateDayDetail.getFieldValue([
                                 "dayDetail",
                                 "departureDate",
                              ]);

                           if (!value || !departureDate)
                              return Promise.resolve();

                           if (
                              value.isValid() &&
                              departureDate.isValid() &&
                              value.isSameOrBefore(departureDate, "second")
                           ) {
                              return Promise.reject(
                                 new Error(
                                    "Ngày trở về phải sau ngày khởi hành!"
                                 )
                              );
                           }

                           return Promise.resolve();
                        },
                     },
                  ]}
               >
                  <DatePicker
                     className="flex left-6"
                     style={{ width: "61%" }}
                     placeholder="Chọn ngày trở về"
                     showTime={{ format: "HH:mm:ss" }}
                     format={DATETIME_FORMAT}
                     disabledDate={disabledPastDate}
                  />
               </Form.Item>

               {/* 3. Số lượng chỗ */}
               <Form.Item
                  name={["dayDetail", "slot"]}
                  label="Số lượng chỗ"
                  rules={[
                     {
                        required: true,
                        message: "Số lượng chỗ không để trống",
                     },
                     {
                        validator: (_, value) => {
                           if (
                              value &&
                              value < (currentDayDetail?.slot || 50)
                           ) {
                              return Promise.reject(
                                 new Error(
                                    `Số lượng chỗ phải lớn hơn hoặc bằng ${
                                       currentDayDetail?.slot || 50
                                    }!`
                                 )
                              );
                           }
                           return Promise.resolve();
                        },
                     },
                  ]}
               >
                  <InputNumber
                     className="flex left-3"
                     min={currentDayDetail?.slot || 50}
                     max={200}
                     style={{ width: "63%" }}
                  />
               </Form.Item>

               {/* 4. Chi phí */}
               <Form.Item
                  name={["dayDetail", "price"]}
                  label="Chi phí"
                  rules={[
                     { required: true, message: "Chi phí không để trống" },
                     {
                        validator: (_, value) => {
                           if (value <= 0) {
                              return Promise.reject(
                                 new Error("Chi phí phải lớn hơn 0!")
                              );
                           }
                           return Promise.resolve();
                        },
                     },
                  ]}
               >
                  <InputNumber
                     className="flex left-13"
                     style={{ width: "57%" }}
                     min={1}
                     max={1000000000}
                     formatter={vietnameseCurrencyFormatter}
                     parser={vietnameseCurrencyParser}
                  />
               </Form.Item>

               <Form.Item
                  label="Trạng thái"
                  name={["dayDetail", "status"]}
                  rules={[
                     {
                        required: true,
                        message: "Vui lòng hãy chọn trạng thái!",
                     },
                  ]}
               >
                  <Select
                     className="w-[180px]!"
                     showSearch
                     placeholder="Chọn 1 hành động"
                     optionFilterProp="label"
                     options={[
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
               </Form.Item>

               <Form.Item>
                  <div className="flex items-center justify-end gap-3">
                     <Button
                        onClick={handleCloseUpdateDayDetailModal}
                        color="danger"
                        variant="outlined"
                        size="large"
                        htmlType="button"
                     >
                        Hủy
                     </Button>
                     <Button
                        loading={isUpdateDayDetailLoading}
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

         {/* ==================================================================================================================== */}
         {/* GIAO DIỆN CỦA HÌNH ẢNH */}
         {/* ==================================================================================================================== */}

         {/* Giao diện xem hình ảnh */}
         <Modal
            onCancel={handleCloseImagesURLsModal}
            title={
               <div className="flex items-center gap-2">
                  <p>Hình ảnh của</p>
                  <p className="text-[#efb748] format">
                     {currentTour?.tourName}
                  </p>
               </div>
            }
            width={1500}
            open={isShowImagesURLsModal}
            footer={false}
         >
            {/* Giao diện header của hình ảnh */}
            <div className="flex justify-end mb-4">
               <Button
                  onClick={handleShowAddImageModal}
                  type="primary"
                  size="large"
               >
                  Thêm hình ảnh
               </Button>
            </div>

            {/* Giao diện bảng hình */}
            <div>
               <Table
                  pagination={false}
                  loading={isImageLoading}
                  columns={columnsImage}
                  dataSource={dataImage}
               />
            </div>

            {/* Giao diện của phân trang hình */}
            <div className="flex items-center justify-end mt-4">
               {imageTotalElements <= 4 ? (
                  ""
               ) : (
                  <div className="page">
                     <Pagination
                        showSizeChanger
                        total={imageTotalElements}
                        showTotal={(total, range) =>
                           `${range[0]}-${range[1]} of ${total} items`
                        }
                        onChange={handleChangeImagePage}
                        defaultPageSize={imagePageSize}
                        current={imageCurrentPage}
                        pageSizeOptions={[4, 8, 16, 32, 100]}
                     />
                  </div>
               )}
            </div>
         </Modal>

         {/* Giao diện thêm hình ảnh */}
         <Modal
            title={`Thêm ảnh cho ${currentTour?.tourName}`}
            onCancel={handleCloseAddImageModal}
            open={isShowAddImageModal}
            footer={false}
         >
            <Form
               form={formAddImages}
               name="add-images"
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
                        onClick={handleCloseAddImageModal}
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
                        loading={isUpdateImageLoading}
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
                                          if (
                                             value.isSameOrBefore(departureDate)
                                          ) {
                                             return Promise.reject(
                                                new Error(
                                                   "Ngày trở về phải sau ngày khởi hành!"
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

         {/* Giao diện header và nút Add chuyến đi */}
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
