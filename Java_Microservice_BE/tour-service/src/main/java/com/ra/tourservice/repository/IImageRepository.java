package com.ra.tourservice.repository;

import com.ra.tourservice.model.entity.Images;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IImageRepository extends JpaRepository<Images,Long> {
}
