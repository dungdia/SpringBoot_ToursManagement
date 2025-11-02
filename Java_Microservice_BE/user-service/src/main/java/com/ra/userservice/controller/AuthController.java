package com.ra.userservice.controller;

import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.req.LoginRequest;
import com.ra.userservice.model.dto.req.RegisterRequest;
import com.ra.userservice.service.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> handleLogin(@Valid @RequestBody LoginRequest loginRequest) throws CustomException {
        return ResponseEntity.ok().body(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<?> handleRegister(@Valid @RequestBody RegisterRequest registerRequest) throws CustomException {
        authService.register(registerRequest);
        return ResponseEntity.ok().body("Đăng ký thành công");
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> payload) throws CustomException {
        String email = payload.get("email");
        String name = payload.get("name");
        return ResponseEntity.ok(authService.loginWithGoogle(email, name));
    }

    @PostMapping("/facebook-login")
    public ResponseEntity<?> handleFacebookLogin(@RequestBody Map<String, String> payload) throws CustomException {
        String email = payload.get("email");
        String name = payload.get("name");
        return ResponseEntity.ok(authService.loginWithFacebook(email, name));
    }


//    @GetMapping("/oauth2/success")
//    public ResponseEntity<?> googleLoginSuccess(@AuthenticationPrincipal OAuth2User principal) {
//        String email = principal.getAttribute("email");
//        String name = principal.getAttribute("name");
//        String picture = principal.getAttribute("picture");
//
//        // TODO: Kiểm tra user trong DB, nếu chưa có thì tạo mới
//        // Sau đó sinh JWT token của bạn và trả về frontend
//
//        return ResponseEntity.ok(Map.of(
//                "email", email,
//                "name", name,
//                "picture", picture
//        ));
//    }
//
//    @GetMapping("/oauth2/failure")
//    public ResponseEntity<?> googleLoginFailure() {
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Đăng nhập Google thất bại");
//    }

}
