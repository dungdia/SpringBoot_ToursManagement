package com.ra.userservice.service.Impl;

import com.ra.userservice.constants.RoleName;
import com.ra.userservice.exception.CustomException;
import com.ra.userservice.model.entity.Roles;
import com.ra.userservice.repository.IRoleRepository;
import com.ra.userservice.service.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {
    private final IRoleRepository roleRepository;

    @Override
    public Roles findByRoleName(RoleName roleName) throws CustomException {
        return roleRepository.findByRoleName(roleName).orElseThrow(() ->
                new CustomException("role not found"));
    }
}
