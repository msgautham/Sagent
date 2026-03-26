package com.parking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;
    private String bookingCode;
    private String parkingSpaceName;
    private String slotNumber;
    private String vehicleNumber;
    private String address;
    private String locationTag;
    private String coordinates;
    private LocalDateTime bookedStartTime;
    private LocalDateTime bookedEndTime;
    private LocalDateTime bufferEndTime;
    private LocalDateTime holdExpiresAt;
    private LocalDateTime actualEntryTime;
    private LocalDateTime actualExitTime;
    private String bookingStatus;
    private String paymentStatus;
    private BigDecimal pricePerHourSnapshot;
    private BigDecimal baseAmount;
    private Integer lateMinutes;
    private BigDecimal lateFee;
    private Integer bufferMinutes;
    private Integer overstayMinutes;
    private Integer overstayBeyondBufferMinutes;
    private BigDecimal totalAmount;
    private BigDecimal finalAmount;
    private String protectionMessage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public String getParkingSpaceName() {
        return parkingSpaceName;
    }

    public void setParkingSpaceName(String parkingSpaceName) {
        this.parkingSpaceName = parkingSpaceName;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLocationTag() {
        return locationTag;
    }

    public void setLocationTag(String locationTag) {
        this.locationTag = locationTag;
    }

    public String getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(String coordinates) {
        this.coordinates = coordinates;
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

    public LocalDateTime getBufferEndTime() {
        return bufferEndTime;
    }

    public void setBufferEndTime(LocalDateTime bufferEndTime) {
        this.bufferEndTime = bufferEndTime;
    }

    public LocalDateTime getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
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

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
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

    public Integer getBufferMinutes() {
        return bufferMinutes;
    }

    public void setBufferMinutes(Integer bufferMinutes) {
        this.bufferMinutes = bufferMinutes;
    }

    public Integer getOverstayMinutes() {
        return overstayMinutes;
    }

    public void setOverstayMinutes(Integer overstayMinutes) {
        this.overstayMinutes = overstayMinutes;
    }

    public Integer getOverstayBeyondBufferMinutes() {
        return overstayBeyondBufferMinutes;
    }

    public void setOverstayBeyondBufferMinutes(Integer overstayBeyondBufferMinutes) {
        this.overstayBeyondBufferMinutes = overstayBeyondBufferMinutes;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(BigDecimal finalAmount) {
        this.finalAmount = finalAmount;
    }

    public String getProtectionMessage() {
        return protectionMessage;
    }

    public void setProtectionMessage(String protectionMessage) {
        this.protectionMessage = protectionMessage;
    }
}
