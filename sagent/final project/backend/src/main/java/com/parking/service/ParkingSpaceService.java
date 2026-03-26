package com.parking.service;

import com.parking.dto.ParkingSlotResponse;
import com.parking.dto.ParkingSpaceRequest;
import com.parking.dto.ParkingSpaceResponse;
import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSpace;
import com.parking.entity.ParkingStatus;
import com.parking.entity.Review;
import com.parking.entity.User;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ParkingSpaceRepository;
import com.parking.repository.ReviewRepository;
import com.parking.util.DistanceUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingSpaceService {

    private final ParkingSpaceRepository parkingSpaceRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ReviewRepository reviewRepository;
    private final AvailabilityService availabilityService;
    private final PricingService pricingService;
    private final SlotAvailabilityService slotAvailabilityService;

    public ParkingSpaceService(ParkingSpaceRepository parkingSpaceRepository,
                               ParkingSlotRepository parkingSlotRepository,
                               ReviewRepository reviewRepository,
                               AvailabilityService availabilityService,
                               PricingService pricingService,
                               SlotAvailabilityService slotAvailabilityService) {
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.reviewRepository = reviewRepository;
        this.availabilityService = availabilityService;
        this.pricingService = pricingService;
        this.slotAvailabilityService = slotAvailabilityService;
    }

    public List<ParkingSpaceResponse> getAllApprovedSpaces() {
        return parkingSpaceRepository.findByStatus(ParkingStatus.APPROVED)
                .stream()
                .filter(ParkingSpace::isActive)
                .filter(space -> space.getAvailableSlots() > 0)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ParkingSpaceResponse getSpace(Long id) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));
        return toResponse(parkingSpace);
    }

    public List<ParkingSpaceResponse> nearby(double lat, double lng, double radiusKm) {
        return parkingSpaceRepository.findByStatus(ParkingStatus.APPROVED).stream()
                .filter(ParkingSpace::isActive)
                .filter(space -> space.getAvailableSlots() > 0)
                .filter(space -> DistanceUtil.haversine(
                        lat,
                        lng,
                        space.getLatitude().doubleValue(),
                        space.getLongitude().doubleValue()
                ) <= radiusKm)
                .map(space -> toResponse(space, lat, lng))
                .sorted(java.util.Comparator.comparing(ParkingSpaceResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    public List<ParkingSpaceResponse> byLender(Long lenderId) {
        return parkingSpaceRepository.findByLender_Id(lenderId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ParkingSpaceResponse> pendingSpaces() {
        return parkingSpaceRepository.findByStatus(ParkingStatus.PENDING_APPROVAL).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ParkingSlotResponse> slotsBySpace(Long parkingSpaceId) {
        return parkingSlotRepository.findByParkingSpace_Id(parkingSpaceId).stream()
                .map(this::toSlotResponse)
                .collect(Collectors.toList());
    }

    public List<ParkingSpaceResponse> findAlternativeSpaces(Long parkingSpaceId,
                                                            LocalDateTime startTime,
                                                            LocalDateTime endTime,
                                                            double radiusKm) {
        ParkingSpace origin = parkingSpaceRepository.findById(parkingSpaceId)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));

        return parkingSpaceRepository.findByStatus(ParkingStatus.APPROVED).stream()
                .filter(ParkingSpace::isActive)
                .filter(space -> !space.getId().equals(parkingSpaceId))
                .filter(space -> DistanceUtil.haversine(
                        origin.getLatitude().doubleValue(),
                        origin.getLongitude().doubleValue(),
                        space.getLatitude().doubleValue(),
                        space.getLongitude().doubleValue()
                ) <= radiusKm)
                .filter(space -> availabilityService.isWithinAvailability(space.getId(), startTime, endTime))
                .filter(space -> parkingSlotRepository.findByParkingSpace_Id(space.getId()).stream()
                        .anyMatch(slot -> slotAvailabilityService.isSlotAvailable(slot, startTime, endTime, null)))
                .map(space -> toResponse(space, origin.getLatitude().doubleValue(), origin.getLongitude().doubleValue()))
                .sorted(java.util.Comparator.comparing(ParkingSpaceResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    @Transactional
    public ParkingSpaceResponse createSpace(User lender, ParkingSpaceRequest request) {
        ParkingSpace parkingSpace = new ParkingSpace();
        parkingSpace.setLender(lender);
        parkingSpace.setName(request.getName());
        parkingSpace.setDescription(request.getDescription());
        parkingSpace.setLatitude(request.getLatitude());
        parkingSpace.setLongitude(request.getLongitude());
        parkingSpace.setAddress(request.getAddress());
        parkingSpace.setLocationTag(isBlank(request.getLocationTag()) ? request.getAddress() : request.getLocationTag());
        parkingSpace.setLocality(isBlank(request.getLocality()) ? request.getAddress() : request.getLocality());
        parkingSpace.setAllowedVehicleType(request.getDefaultSlotType());
        parkingSpace.setAmenities(isBlank(request.getAmenities()) ? "CCTV, Security" : request.getAmenities());
        parkingSpace.setImageUrl(request.getImageUrl());
        parkingSpace.setPricePerHour(request.getPricePerHour());
        parkingSpace.setTotalSlots(request.getTotalSlots());
        parkingSpace.setAvailableSlots(request.getTotalSlots());
        parkingSpace.setStatus(ParkingStatus.PENDING_APPROVAL);
        parkingSpace.setActive(false);
        parkingSpace = parkingSpaceRepository.save(parkingSpace);

        List<ParkingSlot> slots = new ArrayList<>();
        for (int index = 1; index <= request.getTotalSlots(); index++) {
            ParkingSlot slot = new ParkingSlot();
            slot.setParkingSpace(parkingSpace);
            slot.setSlotNumber("AUTO-" + parkingSpace.getId() + "-" + index);
            slot.setSlotType(request.getDefaultSlotType());
            slot.setStatus(com.parking.entity.SlotStatus.AVAILABLE);
            slots.add(slot);
        }
        parkingSlotRepository.saveAll(slots);
        return toResponse(parkingSpace);
    }

    public ParkingSpace approveSpace(Long id, User admin) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));
        parkingSpace.setStatus(ParkingStatus.APPROVED);
        parkingSpace.setActive(true);
        parkingSpace.setReviewedBy(admin);
        parkingSpace.setReviewedAt(java.time.LocalDateTime.now());
        parkingSpace.setRejectionReason(null);
        return parkingSpaceRepository.save(parkingSpace);
    }

    public ParkingSpace rejectSpace(Long id, String rejectionReason, User admin) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));
        parkingSpace.setStatus(ParkingStatus.REJECTED);
        parkingSpace.setActive(false);
        parkingSpace.setRejectionReason(rejectionReason);
        parkingSpace.setReviewedBy(admin);
        parkingSpace.setReviewedAt(java.time.LocalDateTime.now());
        return parkingSpaceRepository.save(parkingSpace);
    }

    public ParkingSpace updatePricing(Long id, java.math.BigDecimal pricePerHour) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));
        parkingSpace.setPricePerHour(pricePerHour);
        return parkingSpaceRepository.save(parkingSpace);
    }

    private ParkingSlotResponse toSlotResponse(ParkingSlot slot) {
        ParkingSlotResponse response = new ParkingSlotResponse();
        response.setId(slot.getId());
        response.setSlotNumber(slot.getSlotNumber());
        response.setSlotType(slot.getSlotType());
        response.setStatus(slot.getStatus().name());
        return response;
    }

    private ParkingSpaceResponse toResponse(ParkingSpace parkingSpace) {
        return toResponse(parkingSpace, null, null);
    }

    private ParkingSpaceResponse toResponse(ParkingSpace parkingSpace, Double lat, Double lng) {
        List<Review> reviews = reviewRepository.findByParkingSpace_Id(parkingSpace.getId());
        ParkingSpaceResponse response = new ParkingSpaceResponse();
        response.setId(parkingSpace.getId());
        response.setName(parkingSpace.getName());
        response.setDescription(parkingSpace.getDescription());
        response.setLatitude(parkingSpace.getLatitude());
        response.setLongitude(parkingSpace.getLongitude());
        response.setAddress(parkingSpace.getAddress());
        response.setLocationTag(parkingSpace.getLocationTag());
        response.setLocality(parkingSpace.getLocality());
        response.setAllowedVehicleType(parkingSpace.getAllowedVehicleType());
        response.setAmenities(parkingSpace.getAmenities());
        response.setImageUrl(parkingSpace.getImageUrl());
        response.setPricePerHour(parkingSpace.getPricePerHour());
        PricingService.PricingResult pricingResult = pricingService.calculateEffectiveHourlyRate(parkingSpace, java.time.LocalDateTime.now());
        response.setEffectivePricePerHour(pricingResult.getEffectiveHourlyRate());
        response.setTotalSlots(parkingSpace.getTotalSlots());
        response.setAvailableSlots(parkingSpace.getAvailableSlots());
        response.setStatus(parkingSpace.getStatus().name());
        response.setActive(parkingSpace.isActive());
        response.setLenderName(parkingSpace.getLender().getName());
        response.setAverageRating(reviews.stream().mapToInt(Review::getRating).average().orElse(0.0));
        response.setPricingReason(pricingResult.getReason());
        response.setRejectionReason(parkingSpace.getRejectionReason());
        response.setReviews(reviews.stream()
                .map(review -> review.getBuyer().getName() + ": " + review.getComment())
                .collect(Collectors.toList()));
        response.setAvailabilitySchedules(availabilityService.getByParkingSpace(parkingSpace.getId()));
        if (lat != null && lng != null) {
            response.setDistanceKm(DistanceUtil.haversine(lat, lng,
                    parkingSpace.getLatitude().doubleValue(),
                    parkingSpace.getLongitude().doubleValue()));
        }
        return response;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
