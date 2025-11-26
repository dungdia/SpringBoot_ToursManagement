package com.ra.bookingservice.service.impl;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.repository.IBookingRepository;
import com.ra.bookingservice.service.IBookingToUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingToUserServiceImpl implements IBookingToUserService {
    private final IBookingRepository bookingRepository;
    @Override
    public Boolean checkIfUserIsUsedBooking(Long userId) throws CustomException {
        Long count = bookingRepository.countByUserId(userId);
        return count != null && count > 0;
    }
}
