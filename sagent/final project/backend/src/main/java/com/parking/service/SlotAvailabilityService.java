package com.parking.service;

import com.parking.entity.Booking;
import com.parking.entity.BookingStatus;
import com.parking.entity.ParkingSlot;
import com.parking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotAvailabilityService {

    public static final int BUFFER_MINUTES = 60;

    private static final EnumSet<BookingStatus> BLOCKING_STATUSES = EnumSet.of(
            BookingStatus.HOLD,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
            BookingStatus.OVERSTAY
    );

    private static final EnumSet<BookingStatus> NEXT_BOOKING_STATUSES = EnumSet.of(
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE
    );

    private final BookingRepository bookingRepository;

    public SlotAvailabilityService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public int getBufferMinutes() {
        return BUFFER_MINUTES;
    }

    public LocalDateTime getBufferEndTime(LocalDateTime bookedEndTime) {
        return bookedEndTime.plusMinutes(BUFFER_MINUTES);
    }

    public LocalDateTime getBufferEndTime(Booking booking) {
        return getBufferEndTime(booking.getBookedEndTime());
    }

    public LocalDateTime getBlockedUntil(Booking booking) {
        LocalDateTime blockedUntil = getBufferEndTime(booking);
        if (booking.getActualExitTime() != null && booking.getActualExitTime().isAfter(blockedUntil)) {
            return booking.getActualExitTime();
        }
        return blockedUntil;
    }

    public boolean isSlotAvailable(ParkingSlot slot,
                                   LocalDateTime requestedStart,
                                   LocalDateTime requestedEnd,
                                   Long excludedBookingId) {
        LocalDateTime requestedBlockedUntil = getBufferEndTime(requestedEnd);
        return bookingRepository.findBySlot_IdAndBookingStatusInOrderByBookedStartTimeAsc(
                        slot.getId(),
                        BLOCKING_STATUSES.stream().toList()
                ).stream()
                .filter(booking -> excludedBookingId == null || !booking.getId().equals(excludedBookingId))
                .filter(this::isBlockingBookingActive)
                .noneMatch(existing -> overlaps(existing, requestedStart, requestedBlockedUntil));
    }

    public List<Booking> findBookingsAtRisk(ParkingSlot slot, Booking sourceBooking, LocalDateTime actualExitTime) {
        return bookingRepository.findBySlot_IdAndBookingStatusInOrderByBookedStartTimeAsc(
                        slot.getId(),
                        NEXT_BOOKING_STATUSES.stream().toList()
                ).stream()
                .filter(booking -> !booking.getId().equals(sourceBooking.getId()))
                .filter(booking -> booking.getBookedStartTime().isBefore(actualExitTime))
                .collect(Collectors.toList());
    }

    private boolean overlaps(Booking existing, LocalDateTime requestedStart, LocalDateTime requestedBlockedUntil) {
        return requestedStart.isBefore(getBlockedUntil(existing))
                && requestedBlockedUntil.isAfter(existing.getBookedStartTime());
    }

    private boolean isBlockingBookingActive(Booking booking) {
        if (booking.getBookingStatus() == BookingStatus.HOLD) {
            return booking.getHoldExpiresAt() == null || LocalDateTime.now().isBefore(booking.getHoldExpiresAt());
        }
        return true;
    }
}
