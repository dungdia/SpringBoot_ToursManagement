package com.ra.userservice.repository;

import com.ra.userservice.constants.Gender;
import com.ra.userservice.model.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface IUserRepository extends JpaRepository<Users,Long> {
    Optional<Users> findByEmail(String email);

    @Query("SELECT u FROM Users u WHERE " +
            "(:search IS NULL OR u.fullName LIKE %:search% " +
            "OR u.email LIKE %:search% " +
            "OR u.phone LIKE %:search%) AND " +
            "(:statusUser IS NULL OR u.status = :statusUser) AND " +
            "(:gender IS NULL OR u.gender = :gender)")
    Page<Users> findAllWithFilters(
            @Param("search") String search,
            @Param("statusUser") Boolean statusUser,
            @Param("gender") Gender gender,
            Pageable pageable
    );

    boolean existsByEmail(String email);
    boolean existsUsersByPhone(String phoneNumber);
}
