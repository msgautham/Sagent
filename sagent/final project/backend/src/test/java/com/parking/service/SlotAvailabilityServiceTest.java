package com.parking.service;

import com.parking.entity.Booking;
import com.parking.entity.BookingStatus;
import com.parking.entity.ParkingSlot;
import com.parking.repository.BookingRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SlotAvailabilityServiceTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final SlotAvailabilityService slotAvailabilityService = new SlotAvailabilityService(bookingRepository);

    @Test
    void blocksBookingInsideSafetyBuffer() {
        ParkingSlot slot = slot(10L);
        Booking existing = booking(1L,
                LocalDateTime.of(2026, 3, 16, 17, 30),
                LocalDateTime.of(2026, 3, 16, 18, 30),
                BookingStatus.CONFIRMED);

        when(bookingRepository.findBySlot_IdAndBookingStatusInOrderByBookedStartTimeAsc(eq(10L), anyList()))
                .thenReturn(List.of(existing));

        boolean available = slotAvailabilityService.isSlotAvailable(
                slot,
                LocalDateTime.of(2026, 3, 16, 19, 0),
                LocalDateTime.of(2026, 3, 16, 20, 0),
                null
        );

        assertFalse(available);
    }

    @Test
    void allowsBookingExactlyAtBufferEnd() {
        ParkingSlot slot = slot(10L);
        Booking existing = booking(1L,
                LocalDateTime.of(2026, 3, 16, 17, 30),
                LocalDateTime.of(2026, 3, 16, 18, 30),
                BookingStatus.CONFIRMED);

        when(bookingRepository.findBySlot_IdAndBookingStatusInOrderByBookedStartTimeAsc(eq(10L), anyList()))
                .thenReturn(List.of(existing));

        boolean available = slotAvailabilityService.isSlotAvailable(
                slot,
                LocalDateTime.of(2026, 3, 16, 19, 30),
                LocalDateTime.of(2026, 3, 16, 20, 30),
                null
        );

        assertTrue(available);
    }

    @Test
    void ignoresExpiredHoldWhenCheckingAvailability() {
        ParkingSlot slot = slot(11L);
        Booking expiredHold = booking(2L,
                LocalDateTime.of(2026, 3, 16, 17, 30),
                LocalDateTime.of(2026, 3, 16, 18, 30),
                BookingStatus.HOLD);
        expiredHold.setHoldExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(bookingRepository.findBySlot_IdAndBookingStatusInOrderByBookedStartTimeAsc(eq(11L), anyList()))
                .thenReturn(List.of(expiredHold));

        boolean available = slotAvailabilityService.isSlotAvailable(
                slot,
                LocalDateTime.of(2026, 3, 16, 18, 45),
                LocalDateTime.of(2026, 3, 16, 19, 15),
                null
        );

        assertTrue(available);
    }

    private ParkingSlot slot(Long id) {
        ParkingSlot slot = new ParkingSlot();
        slot.setId(id);
        return slot;
    }

    private Booking booking(Long id, LocalDateTime start, LocalDateTime end, BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setBookedStartTime(start);
        booking.setBookedEndTime(end);
        booking.setBookingStatus(status);
        return booking;
    }
}
