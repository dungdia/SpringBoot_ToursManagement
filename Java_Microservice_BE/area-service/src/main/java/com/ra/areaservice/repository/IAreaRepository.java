package com.ra.areaservice.repository;

import com.ra.areaservice.model.entity.Areas;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IAreaRepository extends JpaRepository<Areas, Long> {
    boolean existsByAreaName(String name);
}
