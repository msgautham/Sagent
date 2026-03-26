package com.parking.dto;

public class AvailabilityScheduleResponse {

    private Long id;
    private String daysCsv;
    private String startTime;
    private String endTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
