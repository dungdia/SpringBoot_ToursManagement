package com.ra.areaservice.service;

public interface ITourServiceCommunication {
//    Kiểm tra xem khu vực có được sử dụng trong bảng Tours hay không
    Boolean checkIfAreaIsUsedInTour(Long areaId);
//    Kiểm tra tồn tại khu vực trong bảng Tours
    Boolean existsToursByAreaId(Long areaId);
}
