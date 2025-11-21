package com.ra.bookingservice.service;

import com.ra.bookingservice.exception.CustomException;

public interface IBookingToTourService {
    //    Kiểm tra xem tour có được sử dụng trong booking hay không
    Boolean checkIfTourIsUsed(Long tourId) throws CustomException;
    //    Kiểm tra tồn tại tour trong Booking
    Boolean existsByTourId(Long tourId) throws CustomException;
}
