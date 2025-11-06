package com.ra.bookingservice.service.impl;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.resp.service.UserResponseDTO;
import com.ra.bookingservice.service.IBookingToUserServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class BookingToUserServiceCommunicationImpl implements IBookingToUserServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String USER_SERVICE_URL = "http://USER-SERVICE/api/v1/";

    @Override
    public UserResponseDTO getUserById(Long userId) throws CustomException {
        String url = USER_SERVICE_URL + "admin/users/" + userId;
        try {
            return restTemplate.getForObject(url, UserResponseDTO.class);
        } catch (Exception e) {
            throw new CustomException("Lỗi khi gọi User service: "+ e.getMessage());
        }
    }
}
