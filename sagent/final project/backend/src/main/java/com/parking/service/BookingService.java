package com.parking.service;

import com.parking.dto.BookingExtensionRequest;
import com.parking.dto.BookingRequest;
import com.parking.dto.BookingResponse;
import com.parking.entity.Booking;
import com.parking.entity.BookingExtension;
import com.parking.entity.BookingStatus;
import com.parking.entity.ExtensionStatus;
import com.parking.entity.Penalty;
import com.parking.entity.PenaltyStatus;
import com.parking.entity.ParkingSlot;
import com.parking.entity.ParkingSpace;
import com.parking.entity.ParkingStatus;
import com.parking.entity.PaymentStatus;
import com.parking.entity.RoleName;
import com.parking.entity.SlotStatus;
import com.parking.entity.User;
import com.parking.entity.Vehicle;
import com.parking.repository.BookingExtensionRepository;
import com.parking.repository.BookingRepository;
import com.parking.repository.PenaltyRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ParkingSpaceRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final long HOLD_MINUTES = 10L;

    private final BookingRepository bookingRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingExtensionRepository bookingExtensionRepository;
    private final PenaltyRepository penaltyRepository;
    private final NotificationService notificationService;
    private final AvailabilityService availabilityService;
    private final PricingService pricingService;
    private final SlotAvailabilityService slotAvailabilityService;
    private final UserRepository userRepository;
    private final ParkingSpaceService parkingSpaceService;

    public BookingService(BookingRepository bookingRepository,
                          ParkingSpaceRepository parkingSpaceRepository,
                          ParkingSlotRepository parkingSlotRepository,
                          VehicleRepository vehicleRepository,
                          BookingExtensionRepository bookingExtensionRepository,
                          PenaltyRepository penaltyRepository,
                          NotificationService notificationService,
                          AvailabilityService availabilityService,
                          PricingService pricingService,
                          SlotAvailabilityService slotAvailabilityService,
                          UserRepository userRepository,
                          ParkingSpaceService parkingSpaceService) {
        this.bookingRepository = bookingRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingExtensionRepository = bookingExtensionRepository;
        this.penaltyRepository = penaltyRepository;
        this.notificationService = notificationService;
        this.availabilityService = availabilityService;
        this.pricingService = pricingService;
        this.slotAvailabilityService = slotAvailabilityService;
        this.userRepository = userRepository;
        this.parkingSpaceService = parkingSpaceService;
    }

    @Transactional
    public BookingResponse createBooking(User buyer, BookingRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        if (!vehicle.getBuyer().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Vehicle does not belong to buyer");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        ParkingSpace parkingSpace = parkingSpaceRepository.findById(request.getParkingSpaceId())
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));
        if (parkingSpace.getStatus() != ParkingStatus.APPROVED || !parkingSpace.isActive()) {
            throw new IllegalArgumentException("Parking space is not available for booking");
        }
        if (!availabilityService.isWithinAvailability(parkingSpace.getId(), request.getStartTime(), request.getEndTime())) {
            throw new IllegalArgumentException("Selected time is outside lender availability");
        }
        if (parkingSpace.getAllowedVehicleType() != null
                && !parkingSpace.getAllowedVehicleType().equalsIgnoreCase(vehicle.getVehicleType())
                && !"CAR".equalsIgnoreCase(parkingSpace.getAllowedVehicleType())) {
            throw new IllegalArgumentException("Vehicle type is not allowed for this parking space");
        }

        ParkingSlot slot = resolveAvailableSlot(parkingSpace.getId(), request.getSlotId(), request.getStartTime(), request.getEndTime(), null);

        PricingService.PricingResult pricingResult = pricingService.calculateEffectiveHourlyRate(parkingSpace, request.getStartTime());
        BigDecimal baseAmount = calculateAmount(request.getStartTime(), request.getEndTime(), pricingResult.getEffectiveHourlyRate());
        LocalDateTime now = LocalDateTime.now();

        Booking booking = new Booking();
        booking.setBuyer(buyer);
        booking.setVehicle(vehicle);
        booking.setParkingSpace(parkingSpace);
        booking.setSlot(slot);
        booking.setBookedStartTime(request.getStartTime());
        booking.setBookedEndTime(request.getEndTime());
        booking.setHoldCreatedAt(now);
        booking.setHoldExpiresAt(now.plusMinutes(HOLD_MINUTES));
        booking.setBookingStatus(BookingStatus.HOLD);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setPricePerHourSnapshot(pricingResult.getEffectiveHourlyRate());
        booking.setBaseAmount(baseAmount);
        booking.setTotalAmount(baseAmount);
        booking.setFinalTotalAmount(baseAmount);
        booking = bookingRepository.save(booking);

        notificationService.notify(buyer, "Reservation Hold Created",
                "Booking hold #" + booking.getId() + " expires at " + booking.getHoldExpiresAt()
                        + ". Slot reserved with safety buffer until " + slotAvailabilityService.getBufferEndTime(booking.getBookedEndTime()) + ".");
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse extendBooking(User buyer, Long bookingId, BookingExtensionRequest request) {
        Booking booking = getOwnedBooking(buyer, bookingId);
        if (!request.getRequestedEndTime().isAfter(booking.getBookedEndTime())) {
            throw new IllegalArgumentException("Requested end time must be after current end time");
        }
        if (!availabilityService.isWithinAvailability(booking.getParkingSpace().getId(),
                booking.getBookedStartTime(), request.getRequestedEndTime())) {
            throw new IllegalArgumentException("Requested time is outside lender availability");
        }
        if (!slotAvailabilityService.isSlotAvailable(booking.getSlot(),
                booking.getBookedStartTime(),
                request.getRequestedEndTime(),
                booking.getId())) {
            throw new IllegalArgumentException("Requested extension conflicts with the safety buffer for another booking");
        }

        long extraMinutes = Duration.between(booking.getBookedEndTime(), request.getRequestedEndTime()).toMinutes();
        BigDecimal extraAmount = calculateAmount(booking.getBookedEndTime(), request.getRequestedEndTime(),
                booking.getPricePerHourSnapshot());

        BookingExtension extension = new BookingExtension();
        extension.setBooking(booking);
        extension.setRequestedEndTime(request.getRequestedEndTime());
        extension.setExtraMinutes((int) extraMinutes);
        extension.setExtraAmount(extraAmount);
        extension.setStatus(ExtensionStatus.APPROVED);
        bookingExtensionRepository.save(extension);

        booking.setBookedEndTime(request.getRequestedEndTime());
        booking.setBaseAmount(booking.getBaseAmount().add(extraAmount));
        booking.setTotalAmount(booking.getBaseAmount().add(booking.getLateFee()));
        booking.setFinalTotalAmount(booking.getBaseAmount().add(booking.getLateFee()));
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional
    public Booking confirmBookingPayment(Booking booking) {
        if (booking.getBookingStatus() == BookingStatus.EXPIRED || isHoldExpired(booking)) {
            expireBooking(booking);
            throw new IllegalArgumentException("Reservation hold has expired");
        }
        if (booking.getBookingStatus() == BookingStatus.HOLD) {
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            booking.setPaymentStatus(PaymentStatus.SUCCESS);
            booking.setBookingCode(generateBookingCode());
        } else {
            booking.setPaymentStatus(PaymentStatus.SUCCESS);
        }
        return bookingRepository.save(booking);
    }

    @Transactional
    public BookingResponse checkIn(User buyer, Long bookingId) {
        Booking booking = getOwnedBooking(buyer, bookingId);
        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only confirmed bookings can be checked in");
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(booking.getBookedStartTime())) {
            throw new IllegalArgumentException("Parking is allowed only from the booked start time");
        }
        if (now.isAfter(slotAvailabilityService.getBufferEndTime(booking))) {
            throw new IllegalArgumentException("This booking can no longer be checked in because the safety buffer has ended");
        }
        if (booking.getSlot().getStatus() == SlotStatus.OCCUPIED) {
            throw new IllegalArgumentException("Slot is still occupied. Please review alternative parking suggestions.");
        }
        booking.setActualEntryTime(now);
        booking.setBookingStatus(BookingStatus.ACTIVE);
        booking.getSlot().setStatus(SlotStatus.OCCUPIED);
        parkingSlotRepository.save(booking.getSlot());
        ParkingSpace parkingSpace = booking.getParkingSpace();
        parkingSpace.setAvailableSlots(Math.max(0, parkingSpace.getAvailableSlots() - 1));
        parkingSpaceRepository.save(parkingSpace);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkOut(User buyer, Long bookingId) {
        Booking booking = getOwnedBooking(buyer, bookingId);
        if (booking.getBookingStatus() != BookingStatus.ACTIVE) {
            throw new IllegalArgumentException("Only parked vehicles can be checked out");
        }
        LocalDateTime exitTime = LocalDateTime.now();
        booking.setActualExitTime(exitTime);

        long lateMinutes = Math.max(0, Duration.between(booking.getBookedEndTime(), exitTime).toMinutes());
        BigDecimal lateFee = calculateLateFee(lateMinutes, booking.getPricePerHourSnapshot());
        booking.setLateMinutes((int) lateMinutes);
        booking.setLateFee(lateFee);
        booking.setFinalTotalAmount(booking.getBaseAmount().add(lateFee));
        booking.setTotalAmount(booking.getFinalTotalAmount());
        LocalDateTime bufferEndTime = slotAvailabilityService.getBufferEndTime(booking);
        boolean extremeOverstay = exitTime.isAfter(bufferEndTime);
        booking.setBookingStatus(extremeOverstay ? BookingStatus.OVERSTAY : BookingStatus.COMPLETED);
        if (lateFee.compareTo(BigDecimal.ZERO) > 0) {
            booking.setPaymentStatus(PaymentStatus.PENDING);
        }
        if (extremeOverstay) {
            createOrUpdatePenalty(booking, lateFee);
            notifyAdminsOfOverstay(booking, exitTime);
            notifyAffectedNextUsers(booking, exitTime);
        }

        ParkingSlot slot = booking.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);
        ParkingSpace parkingSpace = booking.getParkingSpace();
        parkingSpace.setAvailableSlots(Math.min(parkingSpace.getTotalSlots(), parkingSpace.getAvailableSlots() + 1));
        parkingSpaceRepository.save(parkingSpace);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void expireUnpaidHolds() {
        bookingRepository.findByBookingStatusAndHoldExpiresAtBefore(BookingStatus.HOLD, LocalDateTime.now())
                .forEach(this::expireBooking);
    }

    public List<BookingResponse> getBuyerBookings(Long buyerId) {
        expireUnpaidHolds();
        return bookingRepository.findByBuyer_IdOrderByBookedStartTimeDesc(buyerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        expireUnpaidHolds();
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getLenderBookings(Long lenderId) {
        expireUnpaidHolds();
        return bookingRepository.findByParkingSpace_Lender_IdOrderByBookedStartTimeDesc(lenderId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Booking getBookingForPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getBookingStatus() == BookingStatus.EXPIRED || isHoldExpired(booking)) {
            expireBooking(booking);
            throw new IllegalArgumentException("Reservation hold has expired");
        }
        return booking;
    }

    private Booking getOwnedBooking(User buyer, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getBuyer().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Booking does not belong to buyer");
        }
        return booking;
    }

    private void expireBooking(Booking booking) {
        if (booking.getBookingStatus() != BookingStatus.HOLD) {
            return;
        }
        booking.setBookingStatus(BookingStatus.EXPIRED);
        booking.setPaymentStatus(PaymentStatus.FAILED);
        bookingRepository.save(booking);
    }

    private boolean isHoldExpired(Booking booking) {
        return booking.getBookingStatus() == BookingStatus.HOLD
                && booking.getHoldExpiresAt() != null
                && LocalDateTime.now().isAfter(booking.getHoldExpiresAt());
    }

    private String generateBookingCode() {
        return "PK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private BigDecimal calculateLateFee(long lateMinutes, BigDecimal pricePerHourSnapshot) {
        if (lateMinutes <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal hours = BigDecimal.valueOf(lateMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.UP);
        return hours.multiply(pricePerHourSnapshot).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAmount(LocalDateTime start, LocalDateTime end, BigDecimal hourlyRate) {
        long minutes = Duration.between(start, end).toMinutes();
        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.UP);
        return hours.multiply(hourlyRate).setScale(2, RoundingMode.HALF_UP);
    }

    private ParkingSlot resolveAvailableSlot(Long parkingSpaceId,
                                             Long requestedSlotId,
                                             LocalDateTime requestedStart,
                                             LocalDateTime requestedEnd,
                                             Long excludedBookingId) {
        List<ParkingSlot> candidateSlots;
        if (requestedSlotId != null) {
            ParkingSlot requestedSlot = parkingSlotRepository.findById(requestedSlotId)
                    .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
            if (!requestedSlot.getParkingSpace().getId().equals(parkingSpaceId)) {
                throw new IllegalArgumentException("Selected slot does not belong to the parking space");
            }
            candidateSlots = List.of(requestedSlot);
        } else {
            candidateSlots = parkingSlotRepository.findByParkingSpace_Id(parkingSpaceId);
        }

        return candidateSlots.stream()
                .filter(slot -> slotAvailabilityService.isSlotAvailable(slot, requestedStart, requestedEnd, excludedBookingId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Selected slot is protected by the safety buffer. Please review nearby alternatives."));
    }

    private void createOrUpdatePenalty(Booking booking, BigDecimal lateFee) {
        if (lateFee.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        Penalty penalty = penaltyRepository.findByBooking_Id(booking.getId()).orElseGet(Penalty::new);
        penalty.setBooking(booking);
        penalty.setPenaltyType("OVERSTAY");
        penalty.setAmount(lateFee);
        penalty.setStatus(PenaltyStatus.PENDING);
        penaltyRepository.save(penalty);
    }

    private void notifyAdminsOfOverstay(Booking booking, LocalDateTime exitTime) {
        userRepository.findByRole_Name(RoleName.ADMIN.name()).forEach(admin ->
                notificationService.notify(
                        admin,
                        "Overstay Alert",
                        "Booking #" + booking.getId() + " exceeded the safety buffer and checked out at " + exitTime + "."
                ));
    }

    private void notifyAffectedNextUsers(Booking booking, LocalDateTime exitTime) {
        slotAvailabilityService.findBookingsAtRisk(booking.getSlot(), booking, exitTime)
                .forEach(nextBooking -> {
                    List<String> alternatives = parkingSpaceService.findAlternativeSpaces(
                                    booking.getParkingSpace().getId(),
                                    nextBooking.getBookedStartTime(),
                                    nextBooking.getBookedEndTime(),
                                    5.0
                            ).stream()
                            .limit(3)
                            .map(space -> space.getName() + " (" + space.getAddress() + ")")
                            .collect(Collectors.toList());

                    String alternativesMessage = alternatives.isEmpty()
                            ? "No nearby alternatives found."
                            : "Nearby alternatives: " + String.join(", ", alternatives);

                    notificationService.notify(
                            nextBooking.getBuyer(),
                            "Booking Delay Notice",
                            "Your scheduled slot may be delayed because the previous vehicle overstayed the safety buffer. "
                                    + alternativesMessage
                    );
                });
    }

    private BookingResponse toResponse(Booking booking) {
        LocalDateTime bufferEndTime = slotAvailabilityService.getBufferEndTime(booking);
        int lateMinutes = booking.getLateMinutes() != null ? booking.getLateMinutes() : 0;
        int overstayBeyondBufferMinutes = booking.getActualExitTime() != null && booking.getActualExitTime().isAfter(bufferEndTime)
                ? (int) Math.max(0, Duration.between(bufferEndTime, booking.getActualExitTime()).toMinutes())
                : 0;
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setParkingSpaceName(booking.getParkingSpace().getName());
        response.setSlotNumber(booking.getSlot().getSlotNumber());
        response.setVehicleNumber(booking.getVehicle().getVehicleNumber());
        response.setAddress(booking.getParkingSpace().getAddress());
        response.setLocationTag(booking.getParkingSpace().getLocationTag());
        response.setCoordinates(booking.getParkingSpace().getLatitude() + ", " + booking.getParkingSpace().getLongitude());
        response.setBookedStartTime(booking.getBookedStartTime());
        response.setBookedEndTime(booking.getBookedEndTime());
        response.setBufferEndTime(bufferEndTime);
        response.setHoldExpiresAt(booking.getHoldExpiresAt());
        response.setActualEntryTime(booking.getActualEntryTime());
        response.setActualExitTime(booking.getActualExitTime());
        response.setBookingStatus(booking.getBookingStatus().name());
        response.setPaymentStatus(booking.getPaymentStatus().name());
        response.setPricePerHourSnapshot(booking.getPricePerHourSnapshot());
        response.setBaseAmount(booking.getBaseAmount() != null ? booking.getBaseAmount() : booking.getTotalAmount());
        response.setLateMinutes(lateMinutes);
        response.setLateFee(booking.getLateFee() != null ? booking.getLateFee() : BigDecimal.ZERO);
        response.setBufferMinutes(slotAvailabilityService.getBufferMinutes());
        response.setOverstayMinutes(lateMinutes);
        response.setOverstayBeyondBufferMinutes(overstayBeyondBufferMinutes);
        response.setTotalAmount(booking.getBaseAmount() != null ? booking.getBaseAmount() : booking.getTotalAmount());
        response.setFinalAmount(booking.getFinalTotalAmount() != null ? booking.getFinalTotalAmount() : booking.getTotalAmount());
        response.setProtectionMessage("Slot reserved with safety buffer until " + bufferEndTime);
        return response;
    }
}
