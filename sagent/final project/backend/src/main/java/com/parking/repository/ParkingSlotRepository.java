package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByParkingSpace_Id(Long parkingSpaceId);
    Optional<ParkingSlot> findFirstByParkingSpace_IdAndStatus(Long parkingSpaceId, SlotStatus status);
}
