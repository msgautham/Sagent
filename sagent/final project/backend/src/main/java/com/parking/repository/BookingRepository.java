package com.parking.repository;

import com.parking.entity.Booking;
import com.parking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBuyer_IdOrderByBookedStartTimeDesc(Long buyerId);
    List<Booking> findByParkingSpace_Lender_IdOrderByBookedStartTimeDesc(Long lenderId);
    List<Booking> findByBookingStatusAndHoldExpiresAtBefore(BookingStatus status, LocalDateTime timestamp);
    List<Booking> findByBuyer_IdAndBookingStatusInOrderByBookedStartTimeDesc(Long buyerId, List<BookingStatus> statuses);
    List<Booking> findBySlot_IdOrderByBookedStartTimeAsc(Long slotId);
    List<Booking> findBySlot_IdAndBookingStatusInOrderByBookedStartTimeAsc(Long slotId, List<BookingStatus> statuses);
}
