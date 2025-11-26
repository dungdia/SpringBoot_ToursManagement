package com.ra.userservice.service;

import com.ra.userservice.exception.CustomException;

public interface IUserToBookingServiceCommunication {
    Boolean checkIfUserIsUsedBooking(Long userId) throws CustomException;
}
