package com.ra.tourservice.repository;

import com.ra.tourservice.model.entity.Images;
import com.ra.tourservice.model.entity.Tours;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;

public interface ITourRepository extends JpaRepository<Tours, Long> {
    Long countByAreaId(Long areaId);
    Boolean existsByAreaId(Long areaId);

    @Query("SELECT DISTINCT t FROM Tours t LEFT JOIN t.dayDetails d WHERE " + // Thêm DISTINCT để tránh trùng lặp Tour
            "(:search IS NULL OR t.tourName LIKE %:search% OR t.description LIKE %:search%) AND " +
            "(:areaId IS NULL OR t.areaId = :areaId)")
    Page<Tours> findAllWithFilters(
            @Param("search") String search,
            @Param("areaId") Long areaId,
            Pageable pageable
    );

    @Query(value = "SELECT img FROM Tours t JOIN t.images img WHERE t.id = :tourId",
            countQuery = "SELECT COUNT(img) FROM Tours t JOIN t.images img WHERE t.id = :tourId")
    Page<Images> findImagesByTourId(@Param("tourId") Long tourId, Pageable pageable);
}
