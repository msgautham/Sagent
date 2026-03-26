package com.parking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class WalletTopUpRequest {

    @NotNull
    @DecimalMin(value = "1.00", inclusive = true)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal amount;

    @NotBlank
    private String paymentMethod;

    @NotBlank
    private String topUpCode;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTopUpCode() {
        return topUpCode;
    }

    public void setTopUpCode(String topUpCode) {
        this.topUpCode = topUpCode;
    }
}
