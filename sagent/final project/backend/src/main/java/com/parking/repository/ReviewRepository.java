package com.parking.repository;

import com.parking.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByParkingSpace_Id(Long parkingSpaceId);
    Optional<Review> findByBuyer_IdAndParkingSpace_Id(Long buyerId, Long parkingSpaceId);
}
