package com.ra.bookingservice.repository;

import com.ra.bookingservice.model.entity.Customers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ICustomerRepository extends JpaRepository<Customers,Long> {
    @Query("SELECT c FROM Customers c WHERE " +
            // Điều kiện bắt buộc: Customer phải thuộc về Booking này
            "c.booking.id = :bookingId AND " +
            // Điều kiện tìm kiếm tùy chọn: Nếu 'search' là NULL/RỖNG, bỏ qua bộ lọc
            "(:search IS NULL OR :search = '' OR " +
            // Tìm kiếm theo customerName
            "LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            // Tìm kiếm theo phone
            "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customers> findAllByBookingIdAndSearchFilter(
            @Param("bookingId") Long bookingId,
            @Param("search") String search,
            Pageable pageable
    );
}
