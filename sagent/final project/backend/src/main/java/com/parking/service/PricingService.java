package com.parking.service;

import com.parking.entity.ParkingSpace;
import com.parking.entity.PricingZone;
import com.parking.repository.PricingZoneRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class PricingService {

    private final PricingZoneRepository pricingZoneRepository;

    public PricingService(PricingZoneRepository pricingZoneRepository) {
        this.pricingZoneRepository = pricingZoneRepository;
    }

    public PricingResult calculateEffectiveHourlyRate(ParkingSpace parkingSpace, LocalDateTime bookingStart) {
        BigDecimal rate = parkingSpace.getPricePerHour();
        StringBuilder reason = new StringBuilder("Base hourly price");

        PricingZone zone = pricingZoneRepository.findByLocalityIgnoreCase(parkingSpace.getLocality()).orElse(null);
        if (zone != null) {
            rate = rate.multiply(zone.getMultiplier());
            reason.append(", locality multiplier ").append(zone.getMultiplier());
        }

        int occupied = parkingSpace.getTotalSlots() - parkingSpace.getAvailableSlots();
        if (parkingSpace.getTotalSlots() > 0 && ((double) occupied / parkingSpace.getTotalSlots()) >= 0.7d) {
            rate = rate.multiply(new BigDecimal("1.15"));
            reason.append(", occupancy surge 1.15x");
        }

        if (bookingStart.getHour() >= 17 && bookingStart.getHour() <= 21) {
            rate = rate.multiply(new BigDecimal("1.10"));
            reason.append(", peak-hour 1.10x");
        }

        return new PricingResult(rate.setScale(2, RoundingMode.HALF_UP), reason.toString());
    }

    public static class PricingResult {
        private final BigDecimal effectiveHourlyRate;
        private final String reason;

        public PricingResult(BigDecimal effectiveHourlyRate, String reason) {
            this.effectiveHourlyRate = effectiveHourlyRate;
            this.reason = reason;
        }

        public BigDecimal getEffectiveHourlyRate() {
            return effectiveHourlyRate;
        }

        public String getReason() {
            return reason;
        }
    }
}
