package com.ra.userservice.service.Impl;

import com.ra.userservice.constants.Gender;
import com.ra.userservice.constants.RoleName;
import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.req.UserRequest;
import com.ra.userservice.model.dto.req.UserUpdateRequest;
import com.ra.userservice.model.dto.resp.UserResponse;
import com.ra.userservice.model.entity.Roles;
import com.ra.userservice.model.entity.Users;
import com.ra.userservice.repository.IRoleRepository;
import com.ra.userservice.repository.IUserRepository;
import com.ra.userservice.service.IOTPService;
import com.ra.userservice.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IRoleRepository roleRepository;
    private final IOTPService otpService;

//    @Override
//    public List<UserResponse> findAll() {
//        List<Users> users = userRepository.findAll();
//        List<UserResponse> responseDTO = new ArrayList<>();
//        for (Users user : users){
//
//            // XỬ LÝ GENDER: Kiểm tra null an toàn. Trả về null nếu DB null.
//            String genderString = user.getGender() != null ? user.getGender().toString() : null;
//
//            // XỬ LÝ ROLES: Đảm bảo không null
//            Set<Roles> userRoles = user.getRoles() != null ? user.getRoles() : new HashSet<>();
//
//            UserResponse userItem = UserResponse.builder()
//                    .id(user.getId())
//                    .fullName(user.getFullName())
//                    .email(user.getEmail())
//                    .phone(user.getPhone())
//                    .gender(genderString)
//                    .roles(userRoles)
//                    .address(user.getAddress())
//                    .status(user.getStatus())
//                    .build();
//            responseDTO.add(userItem);
//        }
//        return responseDTO;
//    }

    @Override
    public Page<Users> findAll(Pageable pageable, String search, Boolean statusUser, Gender gender) {
        return userRepository.findAllWithFilters(search.isEmpty() ? null : search, statusUser, gender, pageable);
    }

    @Override
    public Users findById(Long id) throws CustomException {
        return userRepository.findById(id).orElseThrow(()->new CustomException("Không tìm thấy tài khoản nào"));
    }

    @Override
    public Users save(UserRequest userRequest) throws CustomException {
        if(userRepository.existsByEmail(userRequest.getEmail()) ||
                userRepository.existsUsersByPhone(userRequest.getPhone())){
            throw new CustomException("Email hoặc SĐT đã tồn tại.");
        }
        return userRepository.save(toEntity(userRequest));
    }

    @Override
    public Users update(UserUpdateRequest userUpdateRequest, Long updateId) throws CustomException {
        Users users = findById(updateId);

        users.setFullName(userUpdateRequest.getFullName());
        users.setGender(userUpdateRequest.getGender());
//        Kiểm tra email chỉ khi email thật sự thay đổi
        if (userUpdateRequest.getEmail()!=null
                && !userUpdateRequest.getEmail().equals(users.getEmail()))
        {
//            Kiểm tra email mới có trùng với email khác không
            if(userRepository.existsByEmail(userUpdateRequest.getEmail())){
                throw new CustomException("Email đã tồn tại.", HttpStatus.BAD_REQUEST);
            }
            users.setEmail(userUpdateRequest.getEmail());
        }
//        Kiểm tra phone chỉ khi phone thật sự thay đổi
        if (userUpdateRequest.getPhone()!=null
                && !userUpdateRequest.getPhone().equals(users.getPhone()))
        {
//            Kiểm tra phone mới có trùng với phone khác không
            if(userRepository.existsUsersByPhone(userUpdateRequest.getPhone())){
                throw new CustomException("Số điện thoại đã tồn tại.", HttpStatus.BAD_REQUEST);
            }
            users.setPhone(userUpdateRequest.getPhone());
        }
        users.setStatus(userUpdateRequest.getStatus());
        users.setAddress(userUpdateRequest.getAddress());
//        Cập nhật vai trò (roles)
        if(userUpdateRequest.getRoles()!=null)
        {
            Set<Roles> updateRoles = new HashSet<>();
            for(String role : userUpdateRequest.getRoles()){
                // Tìm hoặc tạo vai trò mới
              try {
                  RoleName roleName = RoleName.valueOf(role);
                  Roles roles = roleRepository.findByRoleName(roleName)
                          .orElseThrow(() -> new CustomException("Vai trò không tồn tại: " + role, HttpStatus.BAD_REQUEST));
                    updateRoles.add(roles);
              }catch (IllegalArgumentException e){
                    throw new CustomException("Vai trò không hợp lệ: " + role, HttpStatus.BAD_REQUEST);
              }
            }
            users.setRoles(updateRoles);// Gán danh sách vai trò mới
        }
        // Lưu người dùng đã cập nhật vào cơ sở dữ liệu
        return userRepository.save(users); // Đảm bảo rằng đối tượng người dùng được lưu lại
    }

    @Override
    public void deleteById(Long id) throws CustomException {
        Users users = findById(id);
        if(userRepository.existsById(id)){
            if(users.getStatus()){
                users.setStatus(false);
                userRepository.save(users);
                throw new CustomException("Tài khoản vẫn đang hoạt động. Trạng thái đã được chuyển sang không hoạt động.");
            }else{
                userRepository.deleteById(id); // Thực hiện xóa tài khoản
            }
        }else {
            throw new CustomException("Không tìm thấy tài khoản");
        }
    }

    @Override
    public Users openBlockUser(Long id) throws CustomException{
        Users user = findById(id);
        if(user == null){
            throw new CustomException("Tài khoản không tồn tại");
        }
        if(user.getStatus()){
            throw new CustomException("Tài khoản vẫn hoạt động");
        }else {
            user.setStatus(true);
        }
        return userRepository.save(user);
    }

    @Override
    public List<String> getAllRoleNames() {
        return roleRepository.findAll().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toList());
    }

    @Override
    public String getEmailById(Long id) throws CustomException {
        Users user = findById(id);
        if(user == null){
            throw new CustomException("Tài khoản email không tồn tại");
        }
        return user.getEmail();
    }

    @Override
    public Users getUserByEmail(String email) throws CustomException {
        if (email == null || email.trim().isEmpty()) {
            throw new CustomException("Email không được để trống");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy email: " + email));
    }

    @Override
    public Users changePassword(String email, String newPassword) throws CustomException {
        // Tìm người dùng theo email
        Users users = userRepository.findByEmail(email).orElseThrow(() ->
                new CustomException("Không tìm thấy email", HttpStatus.NOT_FOUND));

        // Kiểm tra mật khẩu không trống và có độ mạnh
        if (newPassword == null || newPassword.isEmpty()) {
            throw new CustomException("Mật khẩu mới không được để trống", HttpStatus.BAD_REQUEST);
        }

        // Mã hóa mật khẩu và cập nhật
        users.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(users);
    }

    @Override
    public boolean CheckPassword(String email, String inputPassword) throws CustomException {
        // Tìm người dùng theo email
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy email"));

        // Kiểm tra mật khẩu nhập vào so với mật khẩu đã mã hóa
        if (passwordEncoder.matches(inputPassword, user.getPassword())) {
            return true;  // Mật khẩu đúng
        } else {
            throw new CustomException("Mật khẩu không đúng");
        }
    }

    public Users toEntity(UserRequest userRequest) throws CustomException
    {
        // Lấy danh sách roles và thêm role mặc định "User"
        Set<Roles> roles = new HashSet<>();
        Roles role = roleRepository.findByRoleName(RoleName.ROLE_USER).orElseThrow(()->new CustomException("Không tìm thầy", HttpStatus.NOT_FOUND));
        roles.add(role);

        // Kiểm tra và xác thực Gender từ DTO
        Gender gender;
        if (userRequest.getGender() == null) {
            throw new IllegalArgumentException("Gender cannot be null");
        } else {
            gender = userRequest.getGender(); // Đảm bảo DTO đã chuyển đúng kiểu
        }
        return Users.builder()
                .fullName(userRequest.getFullName())
                .email(userRequest.getEmail())
                .phone(userRequest.getPhone())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .gender(gender)
                .phone(userRequest.getPhone())
                .address(userRequest.getAddress())
                .status(true)
                .roles(roles)
                .build();
    }
}
