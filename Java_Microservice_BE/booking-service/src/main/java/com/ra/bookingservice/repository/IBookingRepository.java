package com.ra.bookingservice.repository;

import com.ra.bookingservice.model.entity.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBookingRepository extends JpaRepository<Bookings,Long> {
}
