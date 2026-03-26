package com.parking.service;

import com.parking.dto.DashboardStatsResponse;
import com.parking.entity.BookingStatus;
import com.parking.repository.BookingRepository;
import com.parking.repository.ParkingSpaceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {

    private final ParkingSpaceRepository parkingSpaceRepository;
    private final BookingRepository bookingRepository;

    public DashboardService(ParkingSpaceRepository parkingSpaceRepository, BookingRepository bookingRepository) {
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.bookingRepository = bookingRepository;
    }

    public DashboardStatsResponse lenderStats(Long lenderId) {
        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalSpaces(parkingSpaceRepository.findByLender_Id(lenderId).size());
        response.setTotalBookings(bookingRepository.findByParkingSpace_Lender_IdOrderByBookedStartTimeDesc(lenderId).size());
        response.setActiveBookings(bookingRepository.findByParkingSpace_Lender_IdOrderByBookedStartTimeDesc(lenderId).stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED || booking.getBookingStatus() == BookingStatus.ACTIVE)
                .count());
        response.setRevenue(bookingRepository.findByParkingSpace_Lender_IdOrderByBookedStartTimeDesc(lenderId).stream()
                .map(booking -> booking.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return response;
    }
}
