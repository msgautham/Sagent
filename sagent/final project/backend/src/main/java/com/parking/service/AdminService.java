package com.parking.service;

import com.parking.dto.BookingResponse;
import com.parking.dto.DashboardStatsResponse;
import com.parking.dto.UserResponse;
import com.parking.entity.BookingStatus;
import com.parking.entity.User;
import com.parking.repository.BookingRepository;
import com.parking.repository.ParkingSpaceRepository;
import com.parking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final BookingService bookingService;

    public AdminService(UserRepository userRepository,
                        BookingRepository bookingRepository,
                        ParkingSpaceRepository parkingSpaceRepository,
                        BookingService bookingService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.bookingService = bookingService;
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getBookings() {
        return bookingService.getAllBookings();
    }

    @Transactional
    public UserResponse blockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setBlocked(true);
        return toResponse(userRepository.save(user));
    }

    public DashboardStatsResponse getAdminStats() {
        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalSpaces(parkingSpaceRepository.count());
        response.setTotalBookings(bookingRepository.count());
        response.setActiveBookings(bookingRepository.findAll().stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.ACTIVE || booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .count());
        response.setRevenue(bookingRepository.findAll().stream()
                .map(booking -> booking.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return response;
    }

    public long getPendingSpaceCount() {
        return parkingSpaceRepository.countByStatus(com.parking.entity.ParkingStatus.PENDING_APPROVAL);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().getName());
        response.setBlocked(user.isBlocked());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
