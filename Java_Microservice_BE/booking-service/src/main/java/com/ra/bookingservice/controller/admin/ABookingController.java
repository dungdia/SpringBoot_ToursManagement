package com.ra.bookingservice.controller.admin;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.req.CreateBookingRequestDTO;
import com.ra.bookingservice.model.dto.req.UpdateBookingRequestDTO;
import com.ra.bookingservice.model.dto.resp.BookingResponseDTO;
import com.ra.bookingservice.model.entity.Bookings;
import com.ra.bookingservice.security.annotation.RequireRole;
import com.ra.bookingservice.service.IBookingService;
import com.ra.bookingservice.service.IBookingToTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
public class ABookingController {
    private final IBookingService bookingService;
    private final IBookingToTourService bookingToTourService;

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping
    public ResponseEntity<?> getAllBookings(){
        try {
            return ResponseEntity.ok(bookingService.findAll());
        }catch (Exception ex){
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

}
