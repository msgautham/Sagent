package com.parking.service;

import com.parking.dto.PaymentRequest;
import com.parking.dto.PaymentResponse;
import com.parking.entity.Booking;
import com.parking.entity.Payment;
import com.parking.entity.PaymentStatus;
import com.parking.entity.Transaction;
import com.parking.entity.TransactionType;
import com.parking.entity.User;
import com.parking.entity.Wallet;
import com.parking.repository.PaymentRepository;
import com.parking.repository.TransactionRepository;
import com.parking.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final BookingService bookingService;

    public PaymentService(PaymentRepository paymentRepository,
                          WalletRepository walletRepository,
                          TransactionRepository transactionRepository,
                          NotificationService notificationService,
                          BookingService bookingService) {
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
        this.bookingService = bookingService;
    }

    @Transactional
    public PaymentResponse pay(User user, PaymentRequest request) {
        Booking booking = bookingService.getBookingForPayment(request.getBookingId());
        if (!booking.getBuyer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking does not belong to user");
        }
        if (request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        if (request.getAmount().compareTo(booking.getFinalTotalAmount()) < 0) {
            throw new IllegalArgumentException("Payment amount is lower than outstanding amount");
        }

        Wallet wallet = walletRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        booking = bookingService.confirmBookingPayment(booking);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setBooking(booking);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.DEBIT);
        transactionRepository.save(transaction);

        notificationService.notify(user, "Payment Success", "Payment recorded for booking #" + booking.getId()
                + (booking.getBookingCode() != null ? " (" + booking.getBookingCode() + ")" : ""));
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setBookingId(booking.getId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus().name());
        response.setPaidAt(payment.getPaidAt());
        return response;
    }
}
