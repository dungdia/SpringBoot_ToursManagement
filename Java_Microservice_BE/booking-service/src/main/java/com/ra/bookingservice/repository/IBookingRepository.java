package com.ra.bookingservice.repository;

import com.ra.bookingservice.constants.Status;
import com.ra.bookingservice.model.entity.Bookings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IBookingRepository extends JpaRepository<Bookings,Long> {
    // Kiểm tra xem có bất kỳ booking nào sử dụng DayDetail ID NẰM TRONG danh sách IDs không
    Boolean existsByDayDetailIdIn(List<Long> dayDetailIds);

    Boolean existsByDayDetailId(Long dayDetailId);

    // 🔑 Truy vấn JPQL tùy chỉnh để xử lý bộ lọc tùy chọn
    @Query("SELECT b FROM Bookings b WHERE " +
            "(:status IS NULL OR b.status = :status) AND " +
            "(:userId IS NULL OR b.userId = :userId)")
    Page<Bookings> findAllWithFilters(
            @Param("status") Status status,
            @Param("userId") Long userId,
            Pageable pageable
    );

    Long countByUserId(Long userId);
}
