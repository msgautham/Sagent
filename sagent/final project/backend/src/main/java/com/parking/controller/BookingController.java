package com.parking.controller;

import com.parking.dto.BookingExtensionRequest;
import com.parking.dto.BookingRequest;
import com.parking.dto.BookingResponse;
import com.parking.entity.User;
import com.parking.service.BookingService;
import com.parking.service.UserService;
import com.parking.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @PostMapping
    public ApiResponse<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Booking created", bookingService.createBooking(user, request));
    }

    @PostMapping("/{id}/extend")
    public ApiResponse<BookingResponse> extendBooking(@PathVariable Long id,
                                                      @Valid @RequestBody BookingExtensionRequest request,
                                                      Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Booking extended", bookingService.extendBooking(user, id, request));
    }

    @GetMapping("/me")
    public ApiResponse<List<BookingResponse>> myBookings(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Bookings fetched", bookingService.getBuyerBookings(user.getId()));
    }

    @PostMapping("/{id}/check-in")
    public ApiResponse<BookingResponse> checkIn(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Checked in", bookingService.checkIn(user, id));
    }

    @PostMapping("/{id}/check-out")
    public ApiResponse<BookingResponse> checkOut(@PathVariable Long id, Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Checked out", bookingService.checkOut(user, id));
    }
}
