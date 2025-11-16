package com.ra.areaservice.repository;

import com.ra.areaservice.model.entity.Areas;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IAreaRepository extends JpaRepository<Areas, Long> {
    boolean existsByAreaName(String name);

    @Query("SELECT a FROM Areas a " +
            "WHERE (:search IS NULL OR a.areaName LIKE %:search%) AND " +
            "(:statusArea IS NULL OR a.status = :statusArea)"
    )
    Page<Areas> findAllWithFilters(
            @Param("search") String search,
            @Param("statusArea") Boolean statusArea,
            Pageable pageable
    );
}
