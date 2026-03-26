package com.parking.service;

import com.parking.dto.VehicleRequest;
import com.parking.dto.VehicleResponse;
import com.parking.entity.User;
import com.parking.entity.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<VehicleResponse> getVehicles(Long buyerId) {
        return vehicleRepository.findByBuyer_Id(buyerId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse createVehicle(User buyer, VehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setBuyer(buyer);
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        return toResponse(vehicleRepository.save(vehicle));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();
        response.setId(vehicle.getId());
        response.setVehicleNumber(vehicle.getVehicleNumber());
        response.setVehicleType(vehicle.getVehicleType());
        response.setBrand(vehicle.getBrand());
        response.setModel(vehicle.getModel());
        return response;
    }
}
