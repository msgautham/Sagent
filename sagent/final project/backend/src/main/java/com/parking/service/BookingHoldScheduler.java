package com.parking.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingHoldScheduler {

    private final BookingService bookingService;

    public BookingHoldScheduler(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Scheduled(fixedDelay = 60000)
    public void expireHolds() {
        bookingService.expireUnpaidHolds();
    }
}
