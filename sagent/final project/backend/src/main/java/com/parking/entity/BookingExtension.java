package com.parking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_extensions")
public class BookingExtension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, name = "requested_end_time")
    private LocalDateTime requestedEndTime;

    @Column(nullable = false, name = "extra_minutes")
    private Integer extraMinutes;

    @Column(nullable = false, precision = 10, scale = 2, name = "extra_amount")
    private BigDecimal extraAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExtensionStatus status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(LocalDateTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
    }

    public Integer getExtraMinutes() {
        return extraMinutes;
    }

    public void setExtraMinutes(Integer extraMinutes) {
        this.extraMinutes = extraMinutes;
    }

    public BigDecimal getExtraAmount() {
        return extraAmount;
    }

    public void setExtraAmount(BigDecimal extraAmount) {
        this.extraAmount = extraAmount;
    }

    public ExtensionStatus getStatus() {
        return status;
    }

    public void setStatus(ExtensionStatus status) {
        this.status = status;
    }
}
