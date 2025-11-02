package com.ra.userservice.repository;

import com.ra.userservice.constants.RoleName;
import com.ra.userservice.model.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IRoleRepository extends JpaRepository<Roles,Long> {
    Optional<Roles> findByRoleName(RoleName roleName);
}
