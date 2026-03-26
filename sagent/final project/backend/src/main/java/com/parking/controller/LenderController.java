package com.parking.controller;

import com.parking.dto.AvailabilityScheduleRequest;
import com.parking.dto.AvailabilityScheduleResponse;
import com.parking.dto.BookingResponse;
import com.parking.dto.DashboardStatsResponse;
import com.parking.dto.ParkingSpaceRequest;
import com.parking.dto.ParkingSpaceResponse;
import com.parking.entity.User;
import com.parking.service.AvailabilityService;
import com.parking.service.BookingService;
import com.parking.service.DashboardService;
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
@RequestMapping("/api/lender")
@PreAuthorize("hasRole('PARKING_SPACE_LENDER')")
public class LenderController {

    private final UserService userService;
    private final ParkingSpaceService parkingSpaceService;
    private final BookingService bookingService;
    private final DashboardService dashboardService;
    private final AvailabilityService availabilityService;

    public LenderController(UserService userService,
                            ParkingSpaceService parkingSpaceService,
                            BookingService bookingService,
                            DashboardService dashboardService,
                            AvailabilityService availabilityService) {
        this.userService = userService;
        this.parkingSpaceService = parkingSpaceService;
        this.bookingService = bookingService;
        this.dashboardService = dashboardService;
        this.availabilityService = availabilityService;
    }

    @GetMapping("/spaces")
    public ApiResponse<List<ParkingSpaceResponse>> spaces(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Lender spaces fetched", parkingSpaceService.byLender(user.getId()));
    }

    @PostMapping("/spaces")
    public ApiResponse<ParkingSpaceResponse> createSpace(@Valid @RequestBody ParkingSpaceRequest request,
                                                         Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Parking space submitted for approval", parkingSpaceService.createSpace(user, request));
    }

    @GetMapping("/bookings")
    public ApiResponse<List<BookingResponse>> bookings(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Lender bookings fetched", bookingService.getLenderBookings(user.getId()));
    }

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> stats(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Lender stats fetched", dashboardService.lenderStats(user.getId()));
    }

    @PostMapping("/spaces/{id}/availability")
    public ApiResponse<List<AvailabilityScheduleResponse>> updateAvailability(@PathVariable Long id,
                                                                              @RequestBody List<@Valid AvailabilityScheduleRequest> requests) {
        return ApiResponse.success("Availability updated", availabilityService.replaceSchedules(id, requests));
    }
}
