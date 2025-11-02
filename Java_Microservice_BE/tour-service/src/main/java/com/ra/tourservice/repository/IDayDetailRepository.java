package com.ra.tourservice.repository;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Tours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IDayDetailRepository extends JpaRepository<DayDetails, Long> {
    Optional<DayDetails> findByIdAndTour(Long id, Tours tour) throws CustomException;
    List<DayDetails> findByTour(Tours day) throws CustomException;
}
