package com.ra.bookingservice.service;

import com.ra.bookingservice.exception.CustomException;

import java.util.List;

public interface IBookingToTourServiceCommunication {
    List<Long> getDayDetailIdsByTourId(Long tourId) throws CustomException;
}
