package com.parking.dto;

import java.math.BigDecimal;

public class DashboardStatsResponse {

    private long totalSpaces;
    private long totalBookings;
    private long activeBookings;
    private BigDecimal revenue;

    public long getTotalSpaces() {
        return totalSpaces;
    }

    public void setTotalSpaces(long totalSpaces) {
        this.totalSpaces = totalSpaces;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
}
