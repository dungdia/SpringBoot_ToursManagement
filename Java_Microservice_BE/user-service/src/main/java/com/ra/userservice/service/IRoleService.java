package com.ra.userservice.service;

import com.ra.userservice.constants.RoleName;
import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.entity.Roles;

public interface IRoleService {
    Roles findByRoleName(RoleName roleName) throws CustomException;
}
