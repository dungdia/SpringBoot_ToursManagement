package com.ra.bookingservice.service;

import com.ra.bookingservice.exception.CustomException;

public interface IBookingToUserService {
    Boolean checkIfUserIsUsedBooking(Long userId) throws CustomException;
}
