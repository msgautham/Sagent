package com.parking.service;

import com.parking.entity.Booking;
import com.parking.entity.BookingStatus;
import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSpace;
import com.parking.entity.SlotStatus;
import com.parking.entity.User;
import com.parking.repository.BookingExtensionRepository;
import com.parking.repository.BookingRepository;
import com.parking.repository.PenaltyRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ParkingSpaceRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BookingServiceTimeRulesTest {

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final ParkingSpaceRepository parkingSpaceRepository = mock(ParkingSpaceRepository.class);
    private final ParkingSlotRepository parkingSlotRepository = mock(ParkingSlotRepository.class);
    private final VehicleRepository vehicleRepository = mock(VehicleRepository.class);
    private final BookingExtensionRepository bookingExtensionRepository = mock(BookingExtensionRepository.class);
    private final PenaltyRepository penaltyRepository = mock(PenaltyRepository.class);
    private final NotificationService notificationService = mock(NotificationService.class);
    private final AvailabilityService availabilityService = mock(AvailabilityService.class);
    private final PricingService pricingService = mock(PricingService.class);
    private final SlotAvailabilityService slotAvailabilityService = mock(SlotAvailabilityService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final ParkingSpaceService parkingSpaceService = mock(ParkingSpaceService.class);

    private final BookingService bookingService = new BookingService(
            bookingRepository,
            parkingSpaceRepository,
            parkingSlotRepository,
            vehicleRepository,
            bookingExtensionRepository,
            penaltyRepository,
            notificationService,
            availabilityService,
            pricingService,
            slotAvailabilityService,
            userRepository,
            parkingSpaceService
    );

    @Test
    void rejectsCheckInBeforeBookedStartTime() {
        Booking booking = confirmedBooking(LocalDateTime.now().plusMinutes(10), LocalDateTime.now().plusHours(1));
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.checkIn(booking.getBuyer(), booking.getId())
        );

        assertEquals("Parking is allowed only from the booked start time", exception.getMessage());
    }

    @Test
    void rejectsCheckInAfterSafetyBufferEnds() {
        Booking booking = confirmedBooking(LocalDateTime.now().minusHours(3), LocalDateTime.now().minusHours(2));
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(slotAvailabilityService.getBufferEndTime(booking)).thenReturn(booking.getBookedEndTime().plusHours(1));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.checkIn(booking.getBuyer(), booking.getId())
        );

        assertEquals("This booking can no longer be checked in because the safety buffer has ended", exception.getMessage());
    }

    @Test
    void rejectsCheckOutWhenVehicleWasNotParked() {
        Booking booking = confirmedBooking(LocalDateTime.now().minusMinutes(15), LocalDateTime.now().plusMinutes(45));
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> bookingService.checkOut(booking.getBuyer(), booking.getId())
        );

        assertEquals("Only parked vehicles can be checked out", exception.getMessage());
    }

    private Booking confirmedBooking(LocalDateTime startTime, LocalDateTime endTime) {
        User buyer = new User();
        buyer.setId(1L);

        ParkingSpace parkingSpace = new ParkingSpace();
        parkingSpace.setId(7L);
        parkingSpace.setAvailableSlots(2);
        parkingSpace.setTotalSlots(2);

        ParkingSlot slot = new ParkingSlot();
        slot.setId(5L);
        slot.setStatus(SlotStatus.AVAILABLE);
        slot.setParkingSpace(parkingSpace);

        Booking booking = new Booking();
        booking.setId(99L);
        booking.setBuyer(buyer);
        booking.setSlot(slot);
        booking.setParkingSpace(parkingSpace);
        booking.setBookedStartTime(startTime);
        booking.setBookedEndTime(endTime);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setPricePerHourSnapshot(BigDecimal.TEN);
        booking.setBaseAmount(BigDecimal.TEN);
        booking.setTotalAmount(BigDecimal.TEN);
        booking.setFinalTotalAmount(BigDecimal.TEN);
        return booking;
    }
}
