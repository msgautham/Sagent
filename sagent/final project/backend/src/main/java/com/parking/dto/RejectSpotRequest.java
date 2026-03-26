package com.parking.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectSpotRequest {

    @NotBlank
    private String rejectionReason;

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
