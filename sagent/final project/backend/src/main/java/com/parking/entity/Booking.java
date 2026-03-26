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
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_space_id", nullable = false)
    private ParkingSpace parkingSpace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot slot;

    @Column(nullable = false, name = "booked_start_time")
    private LocalDateTime bookedStartTime;

    @Column(nullable = false, name = "booked_end_time")
    private LocalDateTime bookedEndTime;

    @Column(name = "actual_entry_time")
    private LocalDateTime actualEntryTime;

    @Column(name = "actual_exit_time")
    private LocalDateTime actualExitTime;

    @Column(name = "hold_created_at")
    private LocalDateTime holdCreatedAt;

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;

    @Column(name = "booking_code", unique = true, length = 40)
    private String bookingCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "booking_status", length = 30)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "payment_status", length = 30)
    private PaymentStatus paymentStatus;

    @Column(nullable = false, precision = 10, scale = 2, name = "total_amount")
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 10, scale = 2, name = "price_per_hour_snapshot")
    private BigDecimal pricePerHourSnapshot;

    @Column(nullable = false, precision = 10, scale = 2, name = "base_amount")
    private BigDecimal baseAmount;

    @Column(name = "late_minutes")
    private Integer lateMinutes = 0;

    @Column(precision = 10, scale = 2, name = "late_fee")
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2, name = "final_total_amount")
    private BigDecimal finalTotalAmount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public ParkingSpace getParkingSpace() {
        return parkingSpace;
    }

    public void setParkingSpace(ParkingSpace parkingSpace) {
        this.parkingSpace = parkingSpace;
    }

    public ParkingSlot getSlot() {
        return slot;
    }

    public void setSlot(ParkingSlot slot) {
        this.slot = slot;
    }

    public LocalDateTime getBookedStartTime() {
        return bookedStartTime;
    }

    public void setBookedStartTime(LocalDateTime bookedStartTime) {
        this.bookedStartTime = bookedStartTime;
    }

    public LocalDateTime getBookedEndTime() {
        return bookedEndTime;
    }

    public void setBookedEndTime(LocalDateTime bookedEndTime) {
        this.bookedEndTime = bookedEndTime;
    }

    public LocalDateTime getActualEntryTime() {
        return actualEntryTime;
    }

    public void setActualEntryTime(LocalDateTime actualEntryTime) {
        this.actualEntryTime = actualEntryTime;
    }

    public LocalDateTime getActualExitTime() {
        return actualExitTime;
    }

    public void setActualExitTime(LocalDateTime actualExitTime) {
        this.actualExitTime = actualExitTime;
    }

    public LocalDateTime getHoldCreatedAt() {
        return holdCreatedAt;
    }

    public void setHoldCreatedAt(LocalDateTime holdCreatedAt) {
        this.holdCreatedAt = holdCreatedAt;
    }

    public LocalDateTime getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPricePerHourSnapshot() {
        return pricePerHourSnapshot;
    }

    public void setPricePerHourSnapshot(BigDecimal pricePerHourSnapshot) {
        this.pricePerHourSnapshot = pricePerHourSnapshot;
    }

    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }

    public Integer getLateMinutes() {
        return lateMinutes;
    }

    public void setLateMinutes(Integer lateMinutes) {
        this.lateMinutes = lateMinutes;
    }

    public BigDecimal getLateFee() {
        return lateFee;
    }

    public void setLateFee(BigDecimal lateFee) {
        this.lateFee = lateFee;
    }

    public BigDecimal getFinalTotalAmount() {
        return finalTotalAmount;
    }

    public void setFinalTotalAmount(BigDecimal finalTotalAmount) {
        this.finalTotalAmount = finalTotalAmount;
    }
}
