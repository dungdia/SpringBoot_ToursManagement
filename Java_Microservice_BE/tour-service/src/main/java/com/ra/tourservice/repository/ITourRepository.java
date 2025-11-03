package com.ra.tourservice.repository;

import com.ra.tourservice.model.entity.Tours;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ITourRepository extends JpaRepository<Tours, Long> {
    Long countByAreaId(Long areaId);
    Boolean existsByAreaId(Long areaId);
}
