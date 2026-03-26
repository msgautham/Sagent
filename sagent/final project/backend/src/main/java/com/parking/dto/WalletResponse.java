package com.parking.dto;

import java.math.BigDecimal;
import java.util.List;

public class WalletResponse {

    private BigDecimal balance;
    private List<String> transactions;

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public List<String> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<String> transactions) {
        this.transactions = transactions;
    }
}
