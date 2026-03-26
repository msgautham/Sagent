package com.parking.repository;

import com.parking.entity.AvailabilitySchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvailabilityScheduleRepository extends JpaRepository<AvailabilitySchedule, Long> {
    List<AvailabilitySchedule> findByParkingSpace_Id(Long parkingSpaceId);
}
