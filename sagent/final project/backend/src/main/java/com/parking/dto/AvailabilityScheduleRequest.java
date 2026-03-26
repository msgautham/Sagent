package com.parking.dto;

import jakarta.validation.constraints.NotBlank;

public class AvailabilityScheduleRequest {

    @NotBlank
    private String daysCsv;

    @NotBlank
    private String startTime;

    @NotBlank
    private String endTime;

    public String getDaysCsv() {
        return daysCsv;
    }

    public void setDaysCsv(String daysCsv) {
        this.daysCsv = daysCsv;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
