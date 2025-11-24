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
import com.ra.bookingservice.repository.ICustomerRepository;
import com.ra.bookingservice.service.IBookingService;
import com.ra.bookingservice.service.IBookingToUserServiceCommunication;
import com.ra.bookingservice.service.ISlotToDayDetailServiceCommunication;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {
    private final IBookingRepository bookingRepository;
    private final ICustomerRepository customerRepository;
    private final IBookingToUserServiceCommunication bookingToUserServiceCommunication;
    private final ISlotToDayDetailServiceCommunication slotToDayDetailServiceCommunication;


//  Lấy tất cả booking không phân trang
    @Override
    public List<BookingResponseDTO> findAllNotFilter() {
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

//   Lấy tất cả booking có phân trang
    @Override
    public Page<BookingResponseDTO> findAllWithFilterPage(Status status, Long userId, Pageable pageable) throws CustomException{

        Page<Bookings> bookingPage = bookingRepository.findAllWithFilters(status, userId, pageable);

        List<BookingResponseDTO> dtoList = bookingPage.getContent().stream()
                .map(booking -> {
                    try {
                        UserResponseDTO user = bookingToUserServiceCommunication.getUserById(booking.getUserId());
                        DayDetailResponseDTO dayDetail = slotToDayDetailServiceCommunication.getDayDetailById(booking.getDayDetailId());

                        return mapToBookingResponseDTO(booking, user, dayDetail);
                    } catch (CustomException e) {
                        throw new RuntimeException("Lỗi khi ánh xạ Booking ID: " + booking.getId(), e);
                    }
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, bookingPage.getTotalElements());
    }

//    Lấy tất cả customer trong booking có sẵn có phân trang
@Override
public Page<CustomerResponseDTO> findAllCustomerWithFilterPage(Long bookingId, String search, Pageable pageable) throws CustomException {

    String actualSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

    Page<Customers> customerPage = customerRepository.findAllByBookingIdAndSearchFilter(
            bookingId,
            actualSearch,
            pageable
    );

    List<CustomerResponseDTO> dtoList = customerPage.getContent().stream()
            .map(this::mapToCustomerResponseDTO)
            .collect(Collectors.toList());

    return new PageImpl<>(dtoList, pageable, customerPage.getTotalElements());
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

//    Thêm customer vào booking có sẵn
    @Override
    public BookingResponseDTO saveCustomerByBookingId(CreateBookingRequestDTO createCustomerBookingRequestDTO, Long bookingId) throws CustomException {

        Bookings existingBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy Booking với ID: " + bookingId));

        if (existingBooking.getStatus() == Status.CANCELED || existingBooking.getStatus() == Status.PAID) {
            throw new CustomException("Không thể thêm khách hàng vào Booking đã bị hủy hoặc đã hoàn thành.");
        }

        Long dayDetailId = existingBooking.getDayDetailId();
        DayDetailResponseDTO dayDetail = slotToDayDetailServiceCommunication.getDayDetailById(dayDetailId);

        if (dayDetail == null) {
            throw new CustomException("Không tìm thấy DayDetail liên quan đến Booking này: " + dayDetailId);
        }

        int newRequestedSlots = createCustomerBookingRequestDTO.getCustomers().size();

        // Kiểm tra slot còn đủ không
        if (dayDetail.getSlot() < newRequestedSlots) {
            throw new CustomException("Không đủ chỗ trống trong chuyến đi (Còn: " + dayDetail.getSlot() + ") để thêm " + newRequestedSlots + " khách mới.");
        }

        List<Customers> newCustomers = mapToCustomerEntities(createCustomerBookingRequestDTO.getCustomers(), existingBooking);

        existingBooking.getCustomers().addAll(newCustomers);

        // Lưu Booking
        Bookings updatedBooking = bookingRepository.save(existingBooking);

        // Gọi sang TourService trừ slots
        slotToDayDetailServiceCommunication.deductSlot(updatedBooking.getDayDetailId(), (long) newRequestedSlots);

        // Gọi User-Service để lấy thông tin user (dữ liệu User ID không thay đổi)
        UserResponseDTO user = bookingToUserServiceCommunication.getUserById(updatedBooking.getUserId());

        // Trả về DTO đã cập nhật
        return mapToBookingResponseDTO(updatedBooking, user, dayDetail);
    }

//   Cập nhật customer có sẵn trong booking
@Override
@Transactional // Đảm bảo thao tác đọc và ghi diễn ra trong một giao dịch
public Bookings updateCustomer(CustomerRequestDTO customerRequestDTO, Long bookingId, Long customerId) throws CustomException {

    // 1. Tìm Booking hiện tại
    Bookings existingBooking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new CustomException("Không tìm thấy Booking với ID: " + bookingId));

    // 2. Kiểm tra trạng thái Booking: Chỉ cho phép chỉnh sửa khi đang ở trạng thái xử lý
    if (existingBooking.getStatus() == Status.CANCELED || existingBooking.getStatus() == Status.PAID) {
        throw new CustomException("Không thể chỉnh sửa thông tin khách hàng trong Booking đã bị hủy hoặc đã hoàn thành.");
    }

    // 3. Tìm Customer hiện tại
    Customers existingCustomer = customerRepository.findById(customerId)
            .orElseThrow(() -> new CustomException("Không tìm thấy Customer với ID: " + customerId));

    // 4. Kiểm tra ràng buộc: Đảm bảo Customer thuộc về Booking này
    if (!existingCustomer.getBooking().getId().equals(bookingId)) {
        throw new CustomException("Customer ID " + customerId + " không thuộc về Booking ID " + bookingId + ".");
    }

    existingCustomer.setCustomerName(customerRequestDTO.getCustomerName());
    existingCustomer.setAge(customerRequestDTO.getAge());
    existingCustomer.setPhone(customerRequestDTO.getPhone());
    existingCustomer.setGender(customerRequestDTO.getGender());

    customerRepository.save(existingCustomer);

    return existingBooking;
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
        booking.setStatus(Status.CANCELED);
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

//    Xóa customer có sẵn trong booking
@Override
@Transactional // Đảm bảo giao dịch an toàn cho cả việc xóa và cập nhật slot
public void deleteCustomer(Long bookingId, Long customerId) throws CustomException {

    Bookings existingBooking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new CustomException("Không tìm thấy Booking với ID: " + bookingId));

    // Kiểm tra trạng thái Booking
    if (existingBooking.getStatus() == Status.CANCELED || existingBooking.getStatus() == Status.PAID) {
        throw new CustomException("Không thể xóa khách hàng khỏi Booking đã bị hủy hoặc đã hoàn thành.");
    }

    //  Tìm Customer hiện tại
    Customers existingCustomer = customerRepository.findById(customerId)
            .orElseThrow(() -> new CustomException("Không tìm thấy Customer với ID: " + customerId));

    // : Đảm bảo Customer thuộc về Booking này
    if (!existingCustomer.getBooking().getId().equals(bookingId)) {
        throw new CustomException("Customer ID " + customerId + " không thuộc về Booking ID " + bookingId + ".");
    }

    //  Thực hiện xóa Customer
    customerRepository.delete(existingCustomer);

    // Cập nhật Slot trong Tour Service (TĂNG SLOT LÊN 1)
    try {
        // DayDetail ID liên kết với Booking
        Long dayDetailId = existingBooking.getDayDetailId();

        // Hàm này nên được định nghĩa trong Tour Service để tăng slot
        slotToDayDetailServiceCommunication.addSlot(dayDetailId, 1L);

    } catch (Exception e) {
        throw new CustomException("Xóa Customer thành công, nhưng lỗi khi cập nhật Slot trong Tour Service: " + e.getMessage());
    }
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
