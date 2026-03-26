package com.parking.controller;

import com.parking.dto.GeocodeResponse;
import com.parking.dto.ParkingSlotResponse;
import com.parking.dto.ParkingSpaceResponse;
import com.parking.dto.ReviewRequest;
import com.parking.dto.ReviewResponse;
import com.parking.entity.User;
import com.parking.service.GeocodingService;
import com.parking.service.ParkingSpaceService;
import com.parking.service.ReviewService;
import com.parking.service.UserService;
import com.parking.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/parking-spaces")
public class ParkingSpaceController {

    private final ParkingSpaceService parkingSpaceService;
    private final GeocodingService geocodingService;
    private final ReviewService reviewService;
    private final UserService userService;

    public ParkingSpaceController(ParkingSpaceService parkingSpaceService,
                                  GeocodingService geocodingService,
                                  ReviewService reviewService,
                                  UserService userService) {
        this.parkingSpaceService = parkingSpaceService;
        this.geocodingService = geocodingService;
        this.reviewService = reviewService;
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<List<ParkingSpaceResponse>> getAll() {
        return ApiResponse.success("Parking spaces fetched", parkingSpaceService.getAllApprovedSpaces());
    }

    @GetMapping("/{id}")
    public ApiResponse<ParkingSpaceResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Parking space fetched", parkingSpaceService.getSpace(id));
    }

    @GetMapping("/nearby")
    public ApiResponse<List<ParkingSpaceResponse>> getNearby(@RequestParam double lat,
                                                             @RequestParam double lng,
                                                             @RequestParam(defaultValue = "5") double radius) {
        return ApiResponse.success("Nearby parking spaces fetched", parkingSpaceService.nearby(lat, lng, radius));
    }

    @GetMapping("/geocode")
    public ApiResponse<GeocodeResponse> geocode(@RequestParam String address) {
        return ApiResponse.success("Address resolved", geocodingService.geocode(address));
    }

    @GetMapping("/{id}/slots")
    public ApiResponse<List<ParkingSlotResponse>> getSlots(@PathVariable Long id) {
        return ApiResponse.success("Parking slots fetched", parkingSpaceService.slotsBySpace(id));
    }

    @GetMapping("/{id}/alternatives")
    public ApiResponse<List<ParkingSpaceResponse>> getAlternatives(@PathVariable Long id,
                                                                   @RequestParam LocalDateTime startTime,
                                                                   @RequestParam LocalDateTime endTime,
                                                                   @RequestParam(defaultValue = "5") double radius) {
        return ApiResponse.success(
                "Alternative parking spaces fetched",
                parkingSpaceService.findAlternativeSpaces(id, startTime, endTime, radius)
        );
    }

    @GetMapping("/{id}/reviews")
    public ApiResponse<List<ReviewResponse>> getReviews(@PathVariable Long id) {
        return ApiResponse.success("Reviews fetched", reviewService.getByParkingSpace(id));
    }

    @PostMapping("/{id}/reviews")
    public ApiResponse<ReviewResponse> createReview(@PathVariable Long id,
                                                    @Valid @RequestBody ReviewRequest request,
                                                    Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Review submitted", reviewService.create(user, id, request));
    }
}
