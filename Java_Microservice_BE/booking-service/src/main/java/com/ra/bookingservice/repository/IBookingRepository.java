package com.ra.bookingservice.repository;

import com.ra.bookingservice.model.entity.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IBookingRepository extends JpaRepository<Bookings,Long> {
    // Kiểm tra xem có bất kỳ booking nào sử dụng DayDetail ID NẰM TRONG danh sách IDs không
    Boolean existsByDayDetailIdIn(List<Long> dayDetailIds);

    Boolean existsByDayDetailId(Long dayDetailId);
}
