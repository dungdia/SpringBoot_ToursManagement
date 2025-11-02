package com.ra.userservice.service;

import com.ra.userservice.constants.Gender;
import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.req.UserRequest;
import com.ra.userservice.model.dto.req.UserUpdateRequest;
import com.ra.userservice.model.dto.resp.UserResponse;
import com.ra.userservice.model.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IUserService {
    Page<Users> findAll(Pageable pageable, String search, Boolean statusUser, Gender gender);
//    List<UserResponse> findAll();
    Users findById(Long id) throws CustomException;
    Users save(UserRequest userRequest) throws CustomException;
    Users update(UserUpdateRequest userUpdateRequest,Long updateId) throws CustomException;
    void deleteById(Long id) throws CustomException;
    Users openBlockUser(Long id) throws CustomException;
    List<String> getAllRoleNames();
    String getEmailById(Long id) throws CustomException;
    Users getUserByEmail(String email) throws CustomException;
    Users changePassword(String email,String newPassword) throws CustomException;
    boolean  CheckPassword(String email,String inputPassword) throws CustomException;
}
