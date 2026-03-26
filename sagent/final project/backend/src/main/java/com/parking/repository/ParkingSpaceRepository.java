package com.parking.repository;

import com.parking.entity.ParkingSpace;
import com.parking.entity.ParkingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkingSpaceRepository extends JpaRepository<ParkingSpace, Long> {
    List<ParkingSpace> findByStatus(ParkingStatus status);
    List<ParkingSpace> findByLender_Id(Long lenderId);
    long countByStatus(ParkingStatus status);
}
