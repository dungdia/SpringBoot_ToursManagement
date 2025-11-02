package com.ra.userservice.service.Impl;

import com.ra.userservice.constants.RoleName;
import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.resp.JwtResponse;
import com.ra.userservice.model.dto.req.LoginRequest;
import com.ra.userservice.model.dto.req.RegisterRequest;
import com.ra.userservice.model.entity.Roles;
import com.ra.userservice.model.entity.Users;
import com.ra.userservice.repository.IUserRepository;
import com.ra.userservice.security.jwt.JwtProvider;
import com.ra.userservice.security.principle.UserDetail;
import com.ra.userservice.service.IAuthService;
import com.ra.userservice.service.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {
    private final AuthenticationManager manager;
    private final PasswordEncoder passwordEncoder;
    private final IUserRepository userRepository;
    private final IRoleService roleService;
    private final JwtProvider jwtProvider;

    @Value("${jwt.expired.access}")
    private Long EXPIRED;

    @Override
    public JwtResponse login(LoginRequest loginRequest) throws CustomException {
        Authentication authentication; // Dùng để lưu thông tin xác thực sau khi đăng nhập thành công
        try {
            authentication = manager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (AuthenticationException e) {
            throw new CustomException("Tài khoản hoặc mật khẩu sai");
        }
        UserDetail userDetail = (UserDetail) authentication.getPrincipal();
        if (!userDetail.getUser().getStatus()) {
            throw new CustomException("Tài khoản của bạn đã bị khóa");
        }

        // Lấy danh sách roles của user
        Set<String> roles = userDetail.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

//        Chuyển kiểu enum sang String an toàn
        String genderString = userDetail.getUser().getGender() != null
                ? userDetail.getUser().getGender().name()
                : "";

        return JwtResponse.builder()
                .accessToken(jwtProvider.generateToken(userDetail.getUsername(), roles)) // Tạo token với email và roles
                .expired(EXPIRED)
                .fullName(userDetail.getUser().getFullName())
                .email(userDetail.getUser().getEmail())
                .phone(userDetail.getUser().getPhone())
                .gender(genderString)
                .address(userDetail.getUser().getAddress())
                .roles(userDetail.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet()))
                .status(userDetail.getUser().getStatus())
                .build();
    }

    @Override
    public void register(RegisterRequest registerRequest) throws CustomException {
        Set<Roles> roles = new HashSet<>();
        roles.add(roleService.findByRoleName(RoleName.ROLE_USER));
        Users users = Users.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .status(true)
                .roles(roles)
                .build();
        userRepository.save(users);
    }

    @Override
    public UserDetail getCurrentUser() {
        return (UserDetail) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Override
    public JwtResponse loginWithGoogle(String email, String name) throws CustomException {
        // Gọi phương thức xử lý chung
        return handleSocialLogin(email, name);
    }

    @Override
    public JwtResponse loginWithFacebook(String email, String name) throws CustomException {
        // Gọi phương thức xử lý chung
        return handleSocialLogin(email, name);
    }

    private JwtResponse handleSocialLogin(String email, String name) throws CustomException {
        Users user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Nếu chưa tồn tại => tạo tài khoản mới
            Set<Roles> roles = new HashSet<>();
            roles.add(roleService.findByRoleName(RoleName.ROLE_USER));

            user = Users.builder()
                    .email(email)
                    .fullName(name)
                    .status(true)
                    .password(passwordEncoder.encode("123456")) // hoặc null, nhưng tránh null nếu cột DB NOT NULL
                    .roles(roles)
                    .build();

            userRepository.save(user);
        }

        if (!user.getStatus()) {
            throw new CustomException("Tài khoản của bạn đã bị khóa");
        }


        String token = jwtProvider.generateToken(email,
                user.getRoles().stream()
                        .map(r -> r.getRoleName().name())
                        .collect(Collectors.toSet())
        );


        return JwtResponse.builder()
                .accessToken(token)
                .expired(EXPIRED)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .gender(user.getGender() != null ? user.getGender().name() : "")
                .phone(user.getPhone())
                .address(user.getAddress())
                .roles(user.getRoles().stream().map(r -> r.getRoleName().name()).collect(Collectors.toSet()))
                .status(user.getStatus())
                .build();
    }
}
