package com.ra.bookingservice.controller.admin;

import com.ra.bookingservice.constants.Status;
import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.req.CreateBookingRequestDTO;
import com.ra.bookingservice.model.dto.req.CustomerRequestDTO;
import com.ra.bookingservice.model.dto.resp.BookingResponseDTO;
import com.ra.bookingservice.model.entity.Bookings;
import com.ra.bookingservice.security.annotation.RequireRole;
import com.ra.bookingservice.service.IBookingService;
import com.ra.bookingservice.service.IBookingToTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
public class ABookingController {
    private final IBookingService bookingService;
    private final IBookingToTourService bookingToTourService;

//    Lấy tất cả booking không phân trang
    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/findAllNotFilter")
    public ResponseEntity<?> getAllBookingsNotFilter(){
        try {
            return ResponseEntity.ok(bookingService.findAllNotFilter());
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

//    Lấy tất cả booking có phân trang
    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/findAllWithFilterPage")
    public ResponseEntity<?> getAllBookingsWithFilterPage(
            @RequestParam(required = false)Status status,
            @RequestParam(required = false) Long userId,
            @PageableDefault(page = 0,size = 8,sort = "id",direction = Sort.Direction.ASC) Pageable pageable)
    {
        try {
            return ResponseEntity.ok().body(bookingService.findAllWithFilterPage(status,userId,pageable));
        }catch (CustomException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

//    Lấy tất cả khách hàng có phân trang theo booking
    @RequireRole({"ROLE_USER","ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/findAllCustomerWithFilterPage")
    public ResponseEntity<?> getAllCustomerWithFilterPage(
            @RequestParam(required = false) Long bookingId,
            @RequestParam(defaultValue="") String search,
            @PageableDefault(page = 0,size = 8,sort = "id",direction = Sort.Direction.ASC) Pageable pageable) throws CustomException
    {
        try {
            return ResponseEntity.ok().body(bookingService.findAllCustomerWithFilterPage(bookingId,search,pageable));
        }catch (CustomException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody CreateBookingRequestDTO createBookingRequestDTO){
        try {
            BookingResponseDTO bookingResponseDTO =
                    bookingService.createBooking(createBookingRequestDTO);
           return ResponseEntity.created(URI.create("/api/v1/admin/bookings"))
                   .body(bookingResponseDTO);
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_USER","ROLE_OWNER"})
    @PostMapping("/{bookingId}/addCustomers")
    public ResponseEntity<?> createCustomersByBookingId(
            @PathVariable Long bookingId,
            @Valid @RequestBody CreateBookingRequestDTO createCustomerBookingRequestDTO) throws CustomException {
       try {
           return ResponseEntity.ok().body(bookingService.saveCustomerByBookingId(
                   createCustomerBookingRequestDTO,
                   bookingId));
       }catch (CustomException e){
           return ResponseEntity.badRequest().body(e.getMessage());
       }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_USER","ROLE_OWNER"})
    @PutMapping("/{bookingId}/updateCustomer/{customerId}")
    public ResponseEntity<?> updateCustomerByBookingIdAndCustomerId(
            @PathVariable Long bookingId,
            @PathVariable Long customerId,
            @Valid @RequestBody CustomerRequestDTO customerRequestDTO
    ) throws CustomException{
        try {
            return ResponseEntity.ok().body(bookingService.updateCustomer(
                    customerRequestDTO,
                    bookingId,
                    customerId));
        }catch (CustomException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId) throws CustomException {
        try {
            Bookings bookingResponseDTO =
                    bookingService.updateBookingStatusConFirmed(bookingId);
           return ResponseEntity.ok().body(bookingResponseDTO);
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER,ROLE_USER"})
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) throws CustomException {
        try {
            Bookings bookingResponseDTO =
                    bookingService.updateBookingStatusCancelled(bookingId);
           return ResponseEntity.ok().body(bookingResponseDTO);
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER","ROLE_USER"})
    @PutMapping("/{bookingId}/waiting-for-payment")
    public ResponseEntity<?> waitingForPaymentBooking(@PathVariable Long bookingId) throws CustomException {
        try {
            Bookings bookingResponseDTO =
                    bookingService.updateBookingStatusWaiting_For_Payment(bookingId);
           return ResponseEntity.ok().body(bookingResponseDTO);
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER","ROLE_USER"})
    @PutMapping("/{bookingId}/pay")
    public ResponseEntity<?> payBooking(@PathVariable Long bookingId) throws CustomException {
        try {
            Bookings bookingResponseDTO =
                    bookingService.updateBookingStatusPaid(bookingId);
           return ResponseEntity.ok().body(bookingResponseDTO);
        }catch (Exception ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

//    ===============================
//         Booking liên quan đến Tour
//    ===============================
    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/tours/{tourId}/check")
    public ResponseEntity<?> checkIfTourIsUsed(@PathVariable Long tourId) throws CustomException {
        Boolean isUsed = bookingToTourService.checkIfTourIsUsed(tourId);
        return ResponseEntity.ok().body(isUsed);
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/dayDetails/{dayDetailId}/check")
    public ResponseEntity<?> checkIfDayDetailInTourIsUsed(@PathVariable Long dayDetailId) throws CustomException {
        Boolean isUsed = bookingToTourService.checkIfDayDetailInTourIsUsed(dayDetailId);
        return ResponseEntity.ok().body(isUsed);
    }

    @RequireRole({"ROLE_USER","ROLE_ADMIN", "ROLE_OWNER"})
    @DeleteMapping("/{bookingId}/deleteCustomer/{customerId}")
    public ResponseEntity<?> deleteCustomerByBookingIdAndCustomerId(
            @PathVariable Long bookingId,
            @PathVariable Long customerId
    ) throws CustomException{
        try {
            bookingService.deleteCustomer(bookingId, customerId);
            return ResponseEntity.ok().body("Xoá khách hàng thành công.");
        }catch (CustomException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
