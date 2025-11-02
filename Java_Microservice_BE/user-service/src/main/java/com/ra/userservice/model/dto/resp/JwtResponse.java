package com.ra.userservice.model.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class JwtResponse {
    private String accessToken;
    private final String type = "Bearer";
    private Long expired;
    private String fullName;
    private String email;
    private String gender;
    private String phone;
    private String address;
    private Set<String> roles;
    private Boolean status;
}
