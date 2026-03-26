package com.parking.controller;

import com.parking.dto.BookingResponse;
import com.parking.dto.DashboardStatsResponse;
import com.parking.dto.ParkingSpaceResponse;
import com.parking.dto.PricingUpdateRequest;
import com.parking.dto.RejectSpotRequest;
import com.parking.dto.UserResponse;
import com.parking.entity.User;
import com.parking.service.AdminService;
import com.parking.service.ParkingSpaceService;
import com.parking.service.UserService;
import com.parking.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ParkingSpaceService parkingSpaceService;
    private final UserService userService;

    public AdminController(AdminService adminService, ParkingSpaceService parkingSpaceService, UserService userService) {
        this.adminService = adminService;
        this.parkingSpaceService = parkingSpaceService;
        this.userService = userService;
    }

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> users() {
        return ApiResponse.success("Users fetched", adminService.getUsers());
    }

    @GetMapping("/bookings")
    public ApiResponse<List<BookingResponse>> bookings() {
        return ApiResponse.success("Bookings fetched", adminService.getBookings());
    }

    @PostMapping("/approve-space/{id}")
    public ApiResponse<String> approveSpace(@PathVariable Long id, Authentication authentication) {
        User admin = userService.getCurrentUser(authentication);
        parkingSpaceService.approveSpace(id, admin);
        return ApiResponse.success("Parking space approved", "APPROVED");
    }

    @PostMapping("/reject-space/{id}")
    public ApiResponse<String> rejectSpace(@PathVariable Long id,
                                           @Valid @RequestBody RejectSpotRequest request,
                                           Authentication authentication) {
        User admin = userService.getCurrentUser(authentication);
        parkingSpaceService.rejectSpace(id, request.getRejectionReason(), admin);
        return ApiResponse.success("Parking space rejected", "REJECTED");
    }

    @PostMapping("/update-pricing/{id}")
    public ApiResponse<String> updatePricing(@PathVariable Long id, @Valid @RequestBody PricingUpdateRequest request) {
        parkingSpaceService.updatePricing(id, request.getPricePerHour());
        return ApiResponse.success("Pricing updated", "UPDATED");
    }

    @PostMapping("/block-user/{id}")
    public ApiResponse<UserResponse> blockUser(@PathVariable Long id) {
        return ApiResponse.success("User blocked", adminService.blockUser(id));
    }

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> stats() {
        return ApiResponse.success("Admin stats fetched", adminService.getAdminStats());
    }

    @GetMapping("/spaces/pending")
    public ApiResponse<List<ParkingSpaceResponse>> pendingSpaces() {
        return ApiResponse.success("Pending spaces fetched", parkingSpaceService.pendingSpaces());
    }
}
