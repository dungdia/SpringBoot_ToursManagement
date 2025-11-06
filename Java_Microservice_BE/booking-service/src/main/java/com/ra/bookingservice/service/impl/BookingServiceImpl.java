package com.ra.bookingservice.service.impl;

import com.ra.bookingservice.constants.Status;
import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.req.CreateBookingRequestDTO;
import com.ra.bookingservice.model.dto.req.CustomerRequestDTO;
import com.ra.bookingservice.model.dto.resp.BookingResponseDTO;
import com.ra.bookingservice.model.dto.resp.CustomerResponseDTO;
import com.ra.bookingservice.model.dto.resp.service.DayDetailResponseDTO;
import com.ra.bookingservice.model.dto.resp.service.UserResponseDTO;
import com.ra.bookingservice.model.entity.Bookings;
import com.ra.bookingservice.model.entity.Customers;
import com.ra.bookingservice.repository.IBookingRepository;
import com.ra.bookingservice.service.IBookingService;
import com.ra.bookingservice.service.IBookingToUserServiceCommunication;
import com.ra.bookingservice.service.ISlotToDayDetailServiceCommunication;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {
    private final IBookingRepository bookingRepository;
    private final IBookingToUserServiceCommunication bookingToUserServiceCommunication;
    private final ISlotToDayDetailServiceCommunication slotToDayDetailServiceCommunication;


    @Override
    public List<BookingResponseDTO> findAll() {
        List<BookingResponseDTO> bookingResponseDTOs = new ArrayList<>();
        List<Bookings> bookings = bookingRepository.findAll();
        for (Bookings booking : bookings) {
            try {
                // Gọi User-Service để lấy thông tin user
                UserResponseDTO user = bookingToUserServiceCommunication.getUserById(booking.getUserId());

                // Gọi Tour-Service để lấy thông tin DayDetail
                DayDetailResponseDTO dayDetail = slotToDayDetailServiceCommunication.getDayDetailById(booking.getDayDetailId());

                // Map entity => DTO
                BookingResponseDTO bookingResponseDTO = mapToBookingResponseDTO(booking, user, dayDetail);
                bookingResponseDTOs.add(bookingResponseDTO);
            } catch (CustomException e) {
                // Xử lý ngoại lệ nếu cần thiết (ví dụ: log lỗi)
                throw new RuntimeException("Lỗi khi lấy thông tin booking với ID: " + booking.getId(), e);
            }
        }
        return bookingResponseDTOs;
    }

    @Transactional // Đảm bảo tính toàn vẹn dữ liệu
    @Override
    public BookingResponseDTO createBooking(CreateBookingRequestDTO bookingRequestDTO) throws CustomException {
        // Gọi User-Service để kiểm tra user
        UserResponseDTO user = bookingToUserServiceCommunication.getUserById(bookingRequestDTO.getUserId());
        if (user == null) {
            throw new CustomException("Không tìm thấy người dùng với ID: " + bookingRequestDTO.getUserId());
        }

        // Gọi Tour-Service (DayDetail)
        DayDetailResponseDTO dayDetail = slotToDayDetailServiceCommunication.getDayDetailById(bookingRequestDTO.getDayDetailId());
        if (dayDetail == null) {
            throw new CustomException("Không tìm thấy DayDetail với ID: " + bookingRequestDTO.getDayDetailId());
        }

//        Kiem tra slot còn đủ không
        int requestedSlots = bookingRequestDTO.getCustomers().size();
        if (dayDetail.getSlot() < requestedSlots) {
            throw new CustomException("Không đủ chỗ trống trong chuyến đi (Còn: " + dayDetail.getSlot() + ")");
        }

        // Map DTO => Entity
        Bookings booking = mapToBookingEntity(bookingRequestDTO);

        // Map customers và gán booking
        List<Customers> customers = mapToCustomerEntities(bookingRequestDTO.getCustomers(), booking);
        booking.setCustomers(customers);

        // Lưu Booking
        Bookings savedBooking = bookingRepository.save(booking);

        // Gọi sang TourService trừ slots
        slotToDayDetailServiceCommunication.deductSlot(savedBooking.getDayDetailId(), (long) requestedSlots);

        // Trả về DTO
        return mapToBookingResponseDTO(savedBooking, user, dayDetail);
    }

    @Override
    public Bookings updateBookingStatusConFirmed(Long bookingId) throws CustomException {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking với ID: " + bookingId));
        booking.setStatus(Status.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Override
    public Bookings updateBookingStatusCancelled(Long bookingId) throws CustomException {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking với ID: " + bookingId));
        booking.setStatus(Status.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Override
    public Bookings updateBookingStatusWaiting_For_Payment(Long bookingId) throws CustomException {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking với ID: " + bookingId));
        booking.setStatus(Status.WAITING_FOR_PAYMENT);
        return bookingRepository.save(booking);
    }

    @Override
    public Bookings updateBookingStatusPaid(Long bookingId) throws CustomException {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking với ID: " + bookingId));
        booking.setStatus(Status.PAID);
        return bookingRepository.save(booking);
    }

    // ---------------------- HÀM MAP RIÊNG ----------------------

    /**
     * Map CreateBookingRequestDTO => Bookings entity
     */
    private Bookings mapToBookingEntity(CreateBookingRequestDTO dto) {
        return Bookings.builder()
                .userId(dto.getUserId())
                .dayDetailId(dto.getDayDetailId())
                .status(Status.PENDING) // luôn PENDING khi tạo mới
                .build();
    }

    /**
     * Map danh sách CustomerRequestDTO => Customers entity
     */
    private List<Customers> mapToCustomerEntities(List<CustomerRequestDTO> customerDTOs, Bookings booking) {
        return customerDTOs.stream()
                .map(req -> Customers.builder()
                        .customerName(req.getCustomerName())
                        .age(req.getAge())
                        .phone(req.getPhone())
                        .gender(req.getGender())
                        .booking(booking)
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Map Bookings entity => BookingResponseDTO
     */
    private BookingResponseDTO mapToBookingResponseDTO(Bookings booking, UserResponseDTO user, DayDetailResponseDTO dayDetail) {
        List<CustomerResponseDTO> customerResponses = booking.getCustomers().stream()
                .map(this::mapToCustomerResponseDTO)
                .collect(Collectors.toList());

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .user(user)
                .dayDetail(dayDetail)
                .customers(customerResponses)
                .status(booking.getStatus())
                .build();
    }

    /**
     * Map Customers entity => CustomerResponseDTO
     */
    private CustomerResponseDTO mapToCustomerResponseDTO(Customers customer) {
        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .customerName(customer.getCustomerName())
                .age(customer.getAge())
                .phone(customer.getPhone())
                .gender(customer.getGender())
                .build();
    }
}
