package com.ra.bookingservice.service;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.resp.service.UserResponseDTO;

public interface IBookingToUserServiceCommunication {
    UserResponseDTO getUserById(Long userId) throws CustomException;
}
