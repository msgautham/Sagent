package com.parking.repository;

import com.parking.entity.PricingZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingZoneRepository extends JpaRepository<PricingZone, Long> {
    Optional<PricingZone> findByLocalityIgnoreCase(String locality);
}
