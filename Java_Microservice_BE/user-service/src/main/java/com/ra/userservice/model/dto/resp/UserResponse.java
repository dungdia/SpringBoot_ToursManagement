package com.ra.userservice.model.dto.resp;

import com.ra.userservice.model.entity.Roles;
import lombok.*;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String gender;
    private String address;
    private Boolean status;
    private Set<Roles> roles;
}