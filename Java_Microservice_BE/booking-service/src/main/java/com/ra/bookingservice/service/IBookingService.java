package com.ra.bookingservice.service;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.req.CreateBookingRequestDTO;
import com.ra.bookingservice.model.dto.resp.BookingResponseDTO;
import com.ra.bookingservice.model.entity.Bookings;

import java.util.List;

public interface IBookingService {
    List<BookingResponseDTO> findAll();
    BookingResponseDTO createBooking(CreateBookingRequestDTO bookingRequestDTO) throws CustomException;

    Bookings updateBookingStatusConFirmed(Long bookingId) throws CustomException;

    Bookings updateBookingStatusCancelled(Long bookingId) throws CustomException;

    Bookings updateBookingStatusWaiting_For_Payment(Long bookingId) throws CustomException;

    Bookings updateBookingStatusPaid(Long bookingId) throws CustomException;
}
