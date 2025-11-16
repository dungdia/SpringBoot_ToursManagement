package com.ra.userservice.controller.admin;

import com.ra.userservice.constants.Gender;
import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.req.UserRequest;
import com.ra.userservice.model.dto.req.UserUpdateRequest;
import com.ra.userservice.model.entity.Users;
import com.ra.userservice.repository.IUserRepository;
import com.ra.userservice.service.IOTPService;
import com.ra.userservice.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AUserController {
    private  final IUserService userService;
    private final IOTPService otpService;
    private  final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

//    @GetMapping
//    public ResponseEntity<List<UserResponse>> findAll(){
//        List<UserResponse> userResponses = userService.findAll();
//        return ResponseEntity.ok().body(userResponses);
//    }

    @GetMapping
    public ResponseEntity<?> findALl(
            @PageableDefault(page = 0,size = 5,sort = "id",direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(defaultValue = "")String search,
            @RequestParam(required = false) Boolean statusUser,
            @RequestParam(required = false) Gender gender  // Thêm statusUser

    ) {
        // Tạo một đối tượng Pageable mới với currentPage và pageSize được cung cấp
        return ResponseEntity.ok().body(userService.findAll( pageable,search, statusUser,gender));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> findByUserId(@PathVariable Long userId) throws CustomException {
        return ResponseEntity.ok().body(userService.findById(userId));
    }

    @PostMapping
    public ResponseEntity<?> addNewUser(@Valid @RequestBody UserRequest userRequest) throws CustomException {
        try{
            return ResponseEntity.created(URI.create("api/v1/admin/users")).body(userService.save(userRequest));
        }catch (CustomException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@Valid @RequestBody UserUpdateRequest userUpdateRequest, @PathVariable Long userId) throws CustomException {
        try{
            return ResponseEntity.ok().body(userService.update(userUpdateRequest,userId));
        }catch (CustomException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) throws CustomException {
        try{
            userService.deleteById(userId);
            return ResponseEntity.ok("Xóa tài khoản thành công");
        }catch (CustomException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/unblockStatus/{userId}")
    public ResponseEntity<?> unblockStatus(@PathVariable Long userId) throws  CustomException {
        try{
            Users user = userService.openBlockUser(userId);
            return ResponseEntity.ok(user);
        }catch (CustomException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/roleName")
    public ResponseEntity<?> getAllRoles() {
        List<String> roles = userService.getAllRoleNames();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/email/{userId}")
    public ResponseEntity<String> findEmailById(@PathVariable Long userId) throws CustomException{
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

    @PostMapping("/OTP")
    public ResponseEntity<?> sendMail(@RequestParam String email) throws CustomException {
        try {
            // Tạo mã OTP
            String otp = generateOTP();

            // Chèn mã OTP vào nội dung HTML
            String htmlContent = "<h1>Xin Chào!</h1><p>Mã OTP của bạn là: <strong>" + otp + "</strong></p>";

            // Gửi email với mã OTP
            otpService.sendHTMLMessage(email, "Send OTP", htmlContent);
            // Tạo đối tượng trả về thông báo và mã OTP
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đã gửi email OTP thành công");
            response.put("otp", otp);

            return ResponseEntity.ok().body(response);
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi khi gửi email");
        }
    }

    // Phương thức tạo mã OTP ngẫu nhiên
    private String generateOTP() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < 6; i++) {  // Tạo mã OTP 6 chữ số
            otp.append(random.nextInt(10)); // Chọn ngẫu nhiên từ 0 đến 9
        }
        return otp.toString();
    }

//    Khi đăng nhập Google hoặc facebook sẽ gửi passowrd về email
    @PostMapping("/OTP/change-password-now")
    public ResponseEntity<?> sendMailChangePassword(@RequestParam String email) throws CustomException {
        try {
            Users users = userRepository.findByEmail(email).orElse(null);
            String password ="123456";
            if(users !=null &&  passwordEncoder.matches(password,users.getPassword()))
            {
                // Chèn mã OTP vào nội dung HTML
                String htmlContent = "<h1>Xin Chào!</h1>" +
                        "<p>Mật khẩu mặc định của bạn hiện đang là: <strong>" + password + "</strong></p>" +
                        "<p style=\"color: red;\"><strong>Cần thay đổi ngay lập tức!</strong></p>";

                // Gửi email với mã OTP
                otpService.sendHTMLMessage(email, "Send Password", htmlContent);
                // Tạo đối tượng trả về thông báo và mã OTP
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đã gửi password đến email thành công");
                response.put("password", password);

                return ResponseEntity.ok().body(response);
            }else {
                String info = "Bạn vừa đăng nhập tài khoản thành công bằng Google vào lúc " +
                        java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy"));

                // Chèn thông báo đăng nhập
                String htmlContent = "<h1>Thông Báo Đăng Nhập Thành Công</h1>" +
                        "<p><strong>" + info + "</strong></p>" ;

                // Gửi email với mã OTP
                otpService.sendHTMLMessage(email, "Thông Báo Đăng Nhập Thành Công", htmlContent);
                // Tạo đối tượng trả về thông báo và mã OTP
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đã gửi thông báo đến email thành công");
                response.put("info", info);

                return ResponseEntity.ok().body(response);
            }

        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi khi gửi email");
        }
    }
}
