package com.ra.userservice.service;

import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.dto.resp.JwtResponse;
import com.ra.userservice.model.dto.req.LoginRequest;
import com.ra.userservice.model.dto.req.RegisterRequest;
import com.ra.userservice.security.principle.UserDetail;

public interface IAuthService {
    JwtResponse login(LoginRequest loginRequest) throws CustomException;
    void register(RegisterRequest registerRequest) throws CustomException;

    UserDetail getCurrentUser();

     JwtResponse loginWithGoogle(String email, String name) throws CustomException;
     JwtResponse loginWithFacebook(String email, String name) throws CustomException;
}
