package com.parking.dto;

import jakarta.validation.constraints.NotBlank;

public class VehicleRequest {

    @NotBlank
    private String vehicleNumber;

    @NotBlank
    private String vehicleType;

    @NotBlank
    private String brand;

    @NotBlank
    private String model;

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
