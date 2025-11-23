package com.ra.tourservice.repository;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Tours;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface IDayDetailRepository extends JpaRepository<DayDetails, Long> {
    Optional<DayDetails> findByIdAndTour(Long id, Tours tour) throws CustomException;
    List<DayDetails> findByTour(Tours day) throws CustomException;

    @Query("SELECT d FROM DayDetails d WHERE d.tour.id = :tourId AND " +
            "(:search IS NULL OR CAST(d.slot AS string) LIKE %:search% OR CAST(d.price AS string) LIKE %:search%) AND " +
            "(:status IS NULL OR d.status = :status) AND " +
            // Lọc ngày khởi hành (Departure Date)
            "(:departureDateFrom IS NULL OR d.departureDate >= :departureDateFrom) AND " +
            "(:departureDateTo IS NULL OR d.departureDate <= :departureDateTo) AND " +
            // Lọc ngày quay về (Return Date)
            "(:returnDateFrom IS NULL OR d.returnDate >= :returnDateFrom) AND " +
            "(:returnDateTo IS NULL OR d.returnDate <= :returnDateTo)")
    Page<DayDetails> findAllByTourIdAndDateFilters(
            @Param("tourId") Long tourId,
            @Param("search") String search,
            @Param("status") Boolean status,
            @Param("departureDateFrom") Date departureDateFrom,
            @Param("departureDateTo") Date departureDateTo,
            @Param("returnDateFrom") Date returnDateFrom,
            @Param("returnDateTo") Date returnDateTo,
            Pageable pageable
    );
}
