package com.parking.repository;

import com.parking.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWallet_User_IdOrderByIdDesc(Long userId);
}
