package com.ra.tourservice.service;

import com.ra.tourservice.exception.CustomException;

public interface ITourToAreaService {
//    Kiểm tra xem khu vực có được sử dụng trong bảng Tours hay không
    Boolean checkIfAreaIsUsed(Long areaId);
//    Kiểm tra tồn tại khu vực trong bảng Tours
    Boolean existsByAreaId(Long areaId) throws CustomException;
}
