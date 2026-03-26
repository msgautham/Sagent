package com.parking.repository;

import com.parking.entity.BookingExtension;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingExtensionRepository extends JpaRepository<BookingExtension, Long> {
}
