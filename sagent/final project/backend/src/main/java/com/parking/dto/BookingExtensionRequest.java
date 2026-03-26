package com.parking.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class BookingExtensionRequest {

    @NotNull
    private LocalDateTime requestedEndTime;

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(LocalDateTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
    }
}
