package com.parking.controller;

import com.parking.dto.PaymentRequest;
import com.parking.dto.PaymentResponse;
import com.parking.entity.User;
import com.parking.service.PaymentService;
import com.parking.service.UserService;
import com.parking.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @PostMapping
    public ApiResponse<PaymentResponse> pay(@Valid @RequestBody PaymentRequest request, Authentication authentication) {
        User user = userService.getCurrentUser(authentication);
        return ApiResponse.success("Payment successful", paymentService.pay(user, request));
    }
}
