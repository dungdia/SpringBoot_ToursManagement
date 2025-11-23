package com.ra.bookingservice.service.impl;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.repository.IBookingRepository;
import com.ra.bookingservice.service.IBookingToTourService;
import com.ra.bookingservice.service.IBookingToTourServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingToTourServiceImpl implements IBookingToTourService {
    private final IBookingRepository bookingRepository;
    private final IBookingToTourServiceCommunication bookingToTourServiceCommunication;

    @Override
    public Boolean checkIfTourIsUsed(Long tourId) throws CustomException {
        // Lấy tất cả DayDetail IDs liên quan đến Tour này từ Tour-service
        List<Long> dayDetailIds = bookingToTourServiceCommunication.getDayDetailIdsByTourId(tourId);

        if (dayDetailIds == null || dayDetailIds.isEmpty()) {
            // Tour không có DayDetail nào, nên chắc chắn không có booking
            return false;
        }

        //  Kiểm tra xem có booking nào tồn tại cho bất kỳ DayDetail ID nào trong danh sách không
        return bookingRepository.existsByDayDetailIdIn(dayDetailIds);
    }

    @Override
    public Boolean checkIfDayDetailInTourIsUsed(Long dayDetailId) throws CustomException {
        // Kiểm tra xem có booking nào tồn tại cho DayDetail ID không
        return bookingRepository.existsByDayDetailId(dayDetailId);
    }

    @Override
    public Boolean existsByTourId(Long tourId) throws CustomException {
//        Kiểm tra có booking nào sử dụng Tour ID không
        return checkIfTourIsUsed(tourId);
    }
}