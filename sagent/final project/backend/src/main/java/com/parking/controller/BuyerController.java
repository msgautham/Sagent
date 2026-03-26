package com.parking.controller;

import com.parking.dto.NotificationResponse;
import com.parking.dto.VehicleRequest;
import com.parking.dto.VehicleResponse;
import com.parking.dto.WalletResponse;
import com.parking.dto.WalletTopUpRequest;
import com.parking.dto.WalletTopUpResponse;
import com.parking.entity.User;
import com.parking.service.NotificationService;
import com.parking.service.UserService;
import com.parking.service.VehicleService;
import com.parking.service.WalletService;
import com.parking.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buyer")
@PreAuthorize("hasRole('PARKING_SPACE_BUYER')")
public class BuyerController {

    private final UserService userService;
    private final VehicleService vehicleService;
    private final WalletService walletService;
    private final NotificationService notificationService;

    public BuyerController(UserService userService,
                           VehicleService vehicleService,
                           WalletService walletService,
                           NotificationService notificationService) {
        this.userService = userService;
        this.vehicleService = vehicleService;
        this.walletService = walletService;
        this.notificationService = notificationService;
    }

    @GetMapping("/vehicles")
    public ApiResponse<List<VehicleResponse>> vehicles(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Vehicles fetched", vehicleService.getVehicles(user.getId()));
    }

    @PostMapping("/vehicles")
    public ApiResponse<VehicleResponse> addVehicle(@Valid @RequestBody VehicleRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Vehicle added", vehicleService.createVehicle(user, request));
    }

    @GetMapping("/wallet")
    public ApiResponse<WalletResponse> wallet(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Wallet fetched", walletService.getWallet(user.getId()));
    }

    @PostMapping("/wallet/top-up")
    public ApiResponse<WalletTopUpResponse> topUpWallet(@Valid @RequestBody WalletTopUpRequest request,
                                                        Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Wallet topped up", walletService.topUp(user, request));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<NotificationResponse>> notifications(Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Notifications fetched", notificationService.getByUser(user.getId()).stream()
                .map(notification -> {
                    NotificationResponse response = new NotificationResponse();
                    response.setId(notification.getId());
                    response.setTitle(notification.getTitle());
                    response.setMessage(notification.getMessage());
                    response.setRead(notification.isRead());
                    return response;
                })
                .collect(Collectors.toList()));
    }
}
