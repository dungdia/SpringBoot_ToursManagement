package com.ra.bookingservice.service;

import com.ra.bookingservice.constants.Status;
import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.req.CreateBookingRequestDTO;
import com.ra.bookingservice.model.dto.req.CustomerRequestDTO;
import com.ra.bookingservice.model.dto.resp.BookingResponseDTO;
import com.ra.bookingservice.model.dto.resp.CustomerResponseDTO;
import com.ra.bookingservice.model.entity.Bookings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IBookingService {
    List<BookingResponseDTO> findAllNotFilter();
    Page<BookingResponseDTO> findAllWithFilterPage(Status status, Long userId, Pageable pageable) throws CustomException;
//    Lấy tất cả customer có phân trang
    Page<CustomerResponseDTO> findAllCustomerWithFilterPage(Long bookingId, String search, Pageable pageable) throws CustomException;
    Page<BookingResponseDTO> findAllByUserIdWithFilterPage(Long userId,Status status,Pageable pageable) throws CustomException;
    BookingResponseDTO createBooking(CreateBookingRequestDTO bookingRequestDTO) throws CustomException;

    // Thêm customer vào booking có sẵn
    BookingResponseDTO saveCustomerByBookingId(CreateBookingRequestDTO createCustomerBookingRequestDTO, Long bookingId) throws CustomException;

//   Cập nhật customer có sẵn trong booking
    Bookings updateCustomer(CustomerRequestDTO customerRequestDTO, Long bookingId, Long customerId) throws CustomException;
    Bookings updateBookingStatusConFirmed(Long bookingId) throws CustomException;

    Bookings updateBookingStatusCancelled(Long bookingId) throws CustomException;

    Bookings updateBookingStatusWaiting_For_Payment(Long bookingId) throws CustomException;

    Bookings updateBookingStatusPaid(Long bookingId) throws CustomException;

    void deleteCustomer(Long bookingId, Long customerId) throws CustomException;
}
