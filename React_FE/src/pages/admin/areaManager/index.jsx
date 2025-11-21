import { getAllUsers } from "@/services/adminService";
import {
   createArea,
   getAllAreas,
   removeArea,
   unblockStatus,
   updateArea,
} from "@/services/areaService";
import {
   Button,
   Form,
   Input,
   message,
   Modal,
   Pagination,
   Select,
   Table,
} from "antd";
import { HttpStatusCode } from "axios";
import "./areaManager.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export default function AreaManager() {
   const [isAreaLoading, setIsAreaLoading] = useState(false);
   const [areas, setAreas] = useState([]);
   const [isShowModal, setIsShowModal] = useState(false);
   const [isloading, setIsLoading] = useState(false);
   const areaNameRef = useRef();
   const [formAddOrUpdateArea] = Form.useForm();

   // Phân trang
   const [totalElements, setTotalElements] = useState(0);
   const [searchValue, setSearchValue] = useState("");
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(8);
   const [checkStatusArea, setCheckStatusArea] = useState("all");

   // Lấy baseId từ localStorage để phục vụ cho việc xóa và sửa
   const [baseId, setBaseId] = useState(null);

   // Modal xóa khu vực
   const [isShowModalDelete, setIsShowModalDelete] = useState(false);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);

   // Modal mở khóa trạng thái khu vực
   const [isShowUnblockStatus, setIsShowUnblockStatus] = useState(false);
   const [isUnblockLoading, setIsUnblockLoading] = useState(false);

   const columns = [
      {
         title: "Tên khu vực",
         dataIndex: "areaName",
         key: "areaName",
         render: (_, area) => (
            <p title={area.areaName} className="format">
               {area.areaName}
            </p>
         ),
      },
      {
         title: "Trạng thái",
         dataIndex: "status",
         key: "status",
         render: (_, area) => (
            <p
               className={
                  area.status
                     ? "font-semibold text-green-400"
                     : "font-semibold text-red-400"
               }
            >
               {area.status ? "Hoạt động" : "Không hoạt động"}
            </p>
         ),
      },
      {
         title: "Chuyến đi",
         dataIndex: "isTour",
         key: "isTour",
         render: (_, area) => (
            <p
               className={
                  area.isTour
                     ? "font-semibold text-[#ff8904]"
                     : "font-semibold text-[#722ed1]"
               }
            >
               {area.isTour ? "Có chuyến" : "Không có chuyến"}
            </p>
         ),
      },
      {
         title: "Hành động",
         key: "action",
         render: (_, area) => {
            return (
               <div className="flex gap-2 items-center">
                  {/* NÚT KHÓA / XÓA*/}
                  {
                     <Button
                        onClick={() => handleShowModalDelete(area.id)}
                        size="large"
                        type="primary"
                        danger
                        ghost
                        style={{
                           color: area.status ? "#efb748" : "",
                           borderColor: area.status ? "#efb748" : "",
                        }}
                     >
                        {area.status ? "Khóa" : "Xóa"}
                     </Button>
                  }

                  {/* NÚT MỞ KHÓA*/}
                  {!area.status && (
                     <Button
                        size="large"
                        onClick={() => handleShowUnblockStatus(area.id)}
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
                        onClick={() => handleEditArea(area)}
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
   const data = areas?.map((area) => {
      return {
         id: area.id,
         key: area.id,
         areaName: area.areaName,
         status: area.status,
         isTour: area.isTour,
      };
   });

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   // Lấy toàn bộ khu vực
   const fetchAreas = useCallback(async () => {
      setIsAreaLoading(true);

      const pageIndex = currentPage - 1;

      const statusParam = checkStatusArea === "all" ? null : checkStatusArea;

      const response = await getAllAreas(
         debounceSearch,
         pageIndex,
         pageSize,
         statusParam
      );
      setAreas(response.content);
      setTotalElements(response.totalElements);
      setIsAreaLoading(false);
   }, [debounceSearch, currentPage, pageSize, checkStatusArea]);

   useEffect(() => {
      fetchAreas();
   }, []);

   // Hiển thị modal thêm / cập nhật
   const handleShowModal = () => {
      setIsShowModal(true);

      setTimeout(() => {
         if (areaNameRef.current) {
            areaNameRef.current.focus();
         }
      }, 100);
   };

   // Ẩn modal thêm / cập nhật
   const handleCloseModal = () => {
      setIsShowModal(false);
      setBaseId(null);
      formAddOrUpdateArea.resetFields();
   };

   // Hiểm thị modal cập nhật
   const handleEditArea = (area) => {
      setIsShowModal(true);
      setBaseId(area.id);
      formAddOrUpdateArea.setFieldsValue({
         areaName: area.areaName,
         status: area.status,
      });
   };

   // Hàm xác nhận thêm / cập nhật khu vực
   const onFinish = async (values) => {
      try {
         setIsLoading(true);
         if (baseId) {
            const responseUpdate = await updateArea(baseId, values);
            if (responseUpdate.status === 200) {
               message.success("Cập nhật danh mục thành công!");
            } else {
               message.error("Cập nhật danh mục thất bại, vui lòng thử lại!");
               return;
            }
         } else {
            const responseCreate = await createArea(values);
            if (responseCreate.status === 201) {
               message.success("Thêm khu vực thành công!");
            } else {
               message.error("Thêm khu vực thất bại, vui lòng thử lại!");
               return;
            }
         }
         fetchAreas();
         handleCloseModal();
      } catch (error) {
         if (error.response.status === HttpStatusCode.BadRequest) {
            message.error(error.response.data);
         } else message.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau!");
      } finally {
         setIsLoading(false);
      }
   };

   // Hiển thị modal xóa
   const handleShowModalDelete = (id) => {
      setBaseId(id);
      setIsShowModalDelete(true);
   };

   // Ẩn modal xóa
   const handleCloseModalDelete = () => {
      setIsShowModalDelete(false);
      setBaseId(null);
   };

   // Hàm xác nhận khóa / xóa
   const handleConfirmDelete = async () => {
      try {
         setIsDeleteLoading(true);
         const response = await removeArea(baseId);

         if (response.status === 200) {
            // Hiện thông báo
            message.success("Xóa khu vực thành công");
         } else {
            message.error("Xóa thất bại, vui lòng thử lại!");
         }
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
         // Render lại danh sách khu vực
         fetchAreas();
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

   // Hàm xác nhận mở khóa khu vực
   const handleConfirmUnblockStatus = async () => {
      try {
         setIsUnblockLoading(true);
         const response = await unblockStatus(baseId);
         if (response.status === 200) {
            message.success("Mở khu vực thành công!");
         }
         // Load lại dữ liệu
         fetchAreas();

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

   // Theo dõi các bộ lọc và trang để tự động gọi API khi chúng thay đổi
   useEffect(() => {
      // Sẽ lấy dữ liệu người dùng khi các tham số lọc thay đổi
      fetchAreas();
   }, [fetchAreas]);

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   // lấy ra area hiện tại qua baseId
   const currentArea = areas?.find((area) => area.id === baseId);
   const statusClass = currentArea
      ? currentArea.status
         ? "text-[#efb748]"
         : "text-red-400"
      : "text-gray-500"; // Mặc định nếu không tìm thấy area hoặc area rỗng
   return (
      <>
         {/* Giao diện thêm / cập nhật khu vực */}
         <Modal
            footer={false}
            title={baseId ? "Cập nhật khu vực" : "Thêm khu vực"}
            open={isShowModal}
            onCancel={handleCloseModal}
         >
            <Form
               form={formAddOrUpdateArea}
               name="add-or-update-area"
               layout="vertical"
               style={{ maxWidth: 600 }}
               onFinish={onFinish}
               autoComplete="off"
               requiredMark={false}
            >
               <Form.Item
                  label="Tên khu vực"
                  name="areaName"
                  rules={[
                     { required: true, message: "Vui lòng nhập tên khu vực!" },
                  ]}
               >
                  <Input ref={areaNameRef} />
               </Form.Item>

               <Form.Item
                  label="Trạng thái"
                  name="status"
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
                     // onChange={onChange}
                     // onSearch={onSearch}
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
                        {baseId ? "Cập nhật" : "Thêm"}
                     </Button>
                  </div>
               </Form.Item>
            </Form>
         </Modal>

         {/* Giao diện xóa khu vực */}
         <Modal
            open={isShowModalDelete}
            onCancel={handleCloseModalDelete}
            // onCancel={handleCloseModalDelete}
            title={
               <div className="flex items-center justify-start gap-1">
                  <h3>Xác nhận</h3>
                  <h3 className={statusClass}>
                     {currentArea ? (currentArea.status ? "khóa" : "xóa") : ""}
                  </h3>
                  <h3>khu vực</h3>
                  <p className="text-red-600 font-semibold">
                     {currentArea?.areaName}{" "}
                  </p>
               </div>
            }
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModalDelete} type="primary" ghost>
                     Hủy
                  </Button>
                  <Button
                     loading={isDeleteLoading}
                     onClick={handleConfirmDelete}
                     type="primary" // Cho nút xóa full đỏ
                     danger={!currentArea?.status}
                     style={{
                        backgroundColor: currentArea?.status
                           ? "#efb748"
                           : undefined,
                        color: currentArea?.status ? "#fff" : undefined, // Màu chữ cho nút "Khóa"
                        borderColor: currentArea?.status
                           ? "#efb748"
                           : undefined, // Màu viền cho nút "Khóa"
                     }}
                  >
                     {currentArea ? (currentArea.status ? "Khóa" : "Xóa") : ""}
                  </Button>
               </div>
            }
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắn chắn muốn</p>
               <p>{currentArea ? (currentArea.status ? "khóa" : "xóa") : ""}</p>
               <p className={`format ${statusClass}`}>
                  {currentArea?.areaName}
               </p>
               <p>này không?</p>
            </div>
         </Modal>

         {/* Modal mở khóa trạng thái khu vực */}
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
                  <h3>Xác nhận mở khu vực</h3>
               </div>
            }
         >
            <div className="flex items-center gap-1">
               <p>Bạn có chắn chắn muốn mở khu vực</p>
               <p className="format text-[#13c2c2]">{currentArea?.areaName}</p>
               <p>này không?</p>
            </div>
         </Modal>

         {/* Giao diện header và Add khu vực */}
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-[24px] font-semibold">Khu vực</h3>
            <Button onClick={handleShowModal} type="primary" size="large">
               Thêm khu vực
            </Button>
         </div>

         {/* Giao diện tìm kiếm khu vực */}
         <div
            id="search-area"
            className="flex gap-5 items-center justify-start mb-3"
         >
            <div className="flex gap-2 items-center">
               <p>Trạng thái</p>
               <Select
                  defaultValue="all"
                  onChange={(value) => {
                     setCheckStatusArea(value); // Cập nhật trạng thái
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
            <div>
               <Input.Search
                  loading={isAreaLoading}
                  placeholder="Tìm kiếm khu vực"
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

         {/* Giao diện bảng dữ liệu khu vực */}
         <div className="mb-4">
            <Table
               loading={isAreaLoading}
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
