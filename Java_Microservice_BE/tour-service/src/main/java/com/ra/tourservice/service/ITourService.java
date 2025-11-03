package com.ra.tourservice.service;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.dto.req.TourRequestDTO;
import com.ra.tourservice.model.dto.req.UpdateTourRequestDTO;
import com.ra.tourservice.model.dto.resp.TourResponseDTO;
import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Tours;

import java.util.List;

public interface ITourService {
    List<TourResponseDTO> findAll();
//    Thêm mới 1 Tour
    TourResponseDTO save(TourRequestDTO tourRequestDTO) throws CustomException;
    Tours findById(Long tourId) throws CustomException;
//    Thêm DayDetails vào Tour đã có sẵn
    Tours saveDayDetails(TourRequestDTO tourRequestDTO, Long tourId) throws CustomException;
//    Thêm Images vào Tour đã có sẵn
    Tours saveImages(TourRequestDTO tourRequestDTO, Long tourId) throws CustomException;
//    Cập nhật Tour theo Id
    TourResponseDTO updateTour(UpdateTourRequestDTO updateTourRequestDTO, Long tourId) throws CustomException;
//    Cập nhật DayDetail theo TourId và DayDetailId
    Tours updateDayDetail(UpdateTourRequestDTO updateTourRequestDTO, Long tourId, Long dayDetailId) throws CustomException;
//    Cập nhật Images theo TourId và ImageId
    Tours updateImages(UpdateTourRequestDTO updateTourRequestDTO, Long tourId, Long imageId) throws CustomException;
//    Lấy DayDetail theo TourId và DayDetailId
    DayDetails findDayDetailById(Long tourId,Long dayDetailId) throws CustomException;
//    Lấy tất cả DayDetails theo TourId
    List<DayDetails> findDayDetailByTourId(Long tourId) throws CustomException;
//    Xóa Tour theo Id
    void deleteById(Long tourId) throws CustomException;
//    Xóa DayDetail theo TourId và DayDetailId
    void deleteDayDetailById(Long tourId, Long dayDetailId) throws CustomException;
    void deleteImageById(Long tourId, Long imageId) throws CustomException;
}
