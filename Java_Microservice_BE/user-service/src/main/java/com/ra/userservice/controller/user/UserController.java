package com.ra.userservice.controller.user;

import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.req.UserUpdateRequest;
import com.ra.userservice.model.dto.resp.booking.BookingInfoResponseDTO;
import com.ra.userservice.model.entity.Users;
import com.ra.userservice.repository.IUserRepository;
import com.ra.userservice.service.IOTPService;
import com.ra.userservice.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.TimeZone;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;
    private final IOTPService otpService;
    private final IUserRepository userRepository;

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@Valid @RequestBody UserUpdateRequest userUpdateRequest, @PathVariable Long userId) throws CustomException {
        try{
            return ResponseEntity.ok().body(userService.update(userUpdateRequest,userId));
        }catch (CustomException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/email/{userId}")
    public ResponseEntity<String> findEmailById(@PathVariable Long userId) throws CustomException {
        try {
            String email = userService.getEmailById(userId);
            return  ResponseEntity.ok(email);
        }catch (CustomException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/change-password/{email}")
    public ResponseEntity<?> changePassword(@PathVariable String email,@RequestParam String newPassword) throws CustomException {
        try {
            // Gọi service để thay đổi mật khẩu
            Users updatedUser = userService.changePassword(email,newPassword);

            // Trả về response thành công
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (CustomException e) {
            // Xử lý lỗi nếu có
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalArgumentException e) {
            // Trả về lỗi không tìm thấy email
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            // Xử lý các lỗi khác
            return new ResponseEntity<>("Đã xảy ra lỗi khi thay đổi mật khẩu", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/check-password")
    public ResponseEntity<?> checkPassword(@RequestParam String email, @RequestParam String inputPassword) {
        try {
            boolean isPasswordValid = userService.CheckPassword(email, inputPassword);

            // Nếu mật khẩu đúng, trả về thông báo thành công
            if (isPasswordValid) {
                return ResponseEntity.ok().body("Mật khẩu chính xác");
            }

            // Nếu mật khẩu sai
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không đúng");
        } catch (IllegalArgumentException e) {
            // Trả về lỗi nếu không tìm thấy email
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (CustomException e) {
            // Trả về lỗi nếu mật khẩu không đúng
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // Xử lý các lỗi khác
            return new ResponseEntity<>("Đã xảy ra lỗi khi kiểm tra mật khẩu", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) throws CustomException {
        return ResponseEntity.ok().body(userService.getUserByEmail(email));
    }

    //    Gửi thông báo khi xác nhận hoặc hủy đặt chỗ
    @PostMapping("/{email}/booking-notification")
    public ResponseEntity<?> sendMailBookingNotification(@PathVariable String email,
                                                         @RequestParam String notificationType,
                                                         @Valid  @RequestBody BookingInfoResponseDTO bookingInfo) throws CustomException
    {
        try {
            String subject;
            String htmlContent;
            // Khởi tạo đối tượng định dạng Ngày giờ
            SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
            sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

            // Format các trường Date
            String formattedDepartureDate = sdf.format(bookingInfo.getDayDetail().getDepartureDate());
            String formattedReturnDate = sdf.format(bookingInfo.getDayDetail().getReturnDate());

            if ("PENDING".equalsIgnoreCase(notificationType)) {
                subject = "Đặt Chỗ Thành Công";
                htmlContent = "<h1>Xin Chào!</h1>" +
                        "<p>Đơn đặt chỗ của bạn đang được xử lý.</p>" +
                        "<p><strong>Thông Tin Đặt Chỗ:</strong> </p>" +
                        "<ul>" +
                        "<li>Tên chuyến đi: " + bookingInfo.getDayDetail().getTour().getTourName() + "</li>" +
                        "<li>Khu vực: " + bookingInfo.getDayDetail().getTour().getArea().getAreaName() + "</li>" +
                        // SỬ DỤNG BIẾN ĐÃ FORMAT
                        "<li>Ngày khởi hành: " + formattedDepartureDate + "</li>" +
                        "<li>Ngày kết thúc: " + formattedReturnDate + "</li>" +
                        "<li>Số chỗ: " + bookingInfo.getCustomers().size() + "</li>" +
                        "<li>Tổng tiền: " + bookingInfo.getDayDetail().getSlot() * bookingInfo.getCustomers().size() + "</li>" +
                        "</ul>";
            } else if ("CANCELED".equalsIgnoreCase(notificationType)) {
                subject = "Hủy Đặt Chỗ Thành Công";
                htmlContent = "<h1>Xin Chào!</h1>" +
                        "<p>Đơn đặt chỗ của bạn đã bị hủy bỏ.</p>" +
                        "<p><strong>Thông Tin Đặt Chỗ:</strong> </p>" +
                        "<ul>" +
                        "<li>Tên chuyến đi: " + bookingInfo.getDayDetail().getTour().getTourName() + "</li>" +
                        "<li>Khu vực: " + bookingInfo.getDayDetail().getTour().getArea().getAreaName() + "</li>" +
                        // SỬ DỤNG BIẾN ĐÃ FORMAT
                        "<li>Ngày khởi hành: " + formattedDepartureDate + "</li>" +
                        "<li>Ngày kết thúc: " + formattedReturnDate + "</li>" +
                        "<li>Số chỗ: " + bookingInfo.getCustomers().size() + "</li>" +
                        "</ul>";
            }  else if ("PAID".equalsIgnoreCase(notificationType)) {
                subject = "Thanh Toán Đặt Chỗ Thành Công";
                htmlContent = "<h1>Xin Chào!</h1>" +
                        "<p>Đơn đặt chỗ của bạn đã thanh toán.</p>" +
                        "<p><strong>Thông Tin Đặt Chỗ:</strong> </p>" +
                        "<ul>" +
                        "<li>Tên chuyến đi: " + bookingInfo.getDayDetail().getTour().getTourName() + "</li>" +
                        "<li>Khu vực: " + bookingInfo.getDayDetail().getTour().getArea().getAreaName() + "</li>" +
                        // SỬ DỤNG BIẾN ĐÃ FORMAT
                        "<li>Ngày khởi hành: " + formattedDepartureDate + "</li>" +
                        "<li>Ngày kết thúc: " + formattedReturnDate + "</li>" +
                        "<li>Số chỗ: " + bookingInfo.getCustomers().size() + "</li>" +
                        "<li>Tổng tiền: " + bookingInfo.getDayDetail().getSlot() * bookingInfo.getCustomers().size() + "</li>" +
                        "</ul>";
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Loại thông báo không hợp lệ.");
            }

            // Gửi email với thông báo đặt chỗ
            otpService.sendHTMLMessage(email, subject, htmlContent);

            // Tạo đối tượng trả về thông báo
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đã gửi thông báo đặt chỗ đến email thành công");

            return ResponseEntity.ok().body(response);
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi khi gửi email");
        }
    }

}
