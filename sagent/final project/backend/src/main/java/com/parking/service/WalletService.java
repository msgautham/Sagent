package com.parking.service;

import com.parking.dto.WalletResponse;
import com.parking.dto.WalletTopUpRequest;
import com.parking.dto.WalletTopUpResponse;
import com.parking.entity.Transaction;
import com.parking.entity.TransactionType;
import com.parking.entity.User;
import com.parking.entity.Wallet;
import com.parking.repository.TransactionRepository;
import com.parking.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private static final String HARDCODED_TOP_UP_METHOD = "HARDCODED";
    private static final String HARDCODED_TOP_UP_CODE = "TOPUP-DEMO-2026";
    private static final BigDecimal MAX_WALLET_AMOUNT = new BigDecimal("99999999.99");

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    public WalletResponse getWallet(Long userId) {
        Wallet wallet = walletRepository.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));
        WalletResponse response = new WalletResponse();
        response.setBalance(wallet.getBalance());
        response.setTransactions(transactionRepository.findByWallet_User_IdOrderByIdDesc(userId).stream()
                .map(transaction -> transaction.getTransactionType().name() + " - " + transaction.getAmount())
                .collect(Collectors.toList()));
        return response;
    }

    @Transactional
    public WalletTopUpResponse topUp(User user, WalletTopUpRequest request) {
        validateHardcodedTopUp(request);

        Wallet wallet = walletRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        BigDecimal updatedBalance = wallet.getBalance().add(request.getAmount());
        wallet.setBalance(updatedBalance);
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.CREDIT);
        transactionRepository.save(transaction);

        WalletTopUpResponse response = new WalletTopUpResponse();
        response.setCreditedAmount(request.getAmount());
        response.setBalance(updatedBalance);
        response.setPaymentMethod(request.getPaymentMethod());
        response.setStatus("SUCCESS");
        return response;
    }

    private void validateHardcodedTopUp(WalletTopUpRequest request) {
        if (request.getAmount().scale() > 2) {
            throw new IllegalArgumentException("Amount can have at most 2 decimal places");
        }
        if (request.getAmount().compareTo(MAX_WALLET_AMOUNT) > 0) {
            throw new IllegalArgumentException("Amount cannot exceed Rs. 99999999.99");
        }
        if (!HARDCODED_TOP_UP_METHOD.equalsIgnoreCase(request.getPaymentMethod())) {
            throw new IllegalArgumentException("Only HARDCODED paymentMethod is supported for now");
        }
        if (!HARDCODED_TOP_UP_CODE.equals(request.getTopUpCode())) {
            throw new IllegalArgumentException("Invalid hardcoded top-up code");
        }
    }
}
