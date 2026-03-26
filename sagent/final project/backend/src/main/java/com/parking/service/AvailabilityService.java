package com.parking.service;

import com.parking.dto.AvailabilityScheduleRequest;
import com.parking.dto.AvailabilityScheduleResponse;
import com.parking.entity.AvailabilitySchedule;
import com.parking.entity.ParkingSpace;
import com.parking.repository.AvailabilityScheduleRepository;
import com.parking.repository.ParkingSpaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final AvailabilityScheduleRepository availabilityScheduleRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;

    public AvailabilityService(AvailabilityScheduleRepository availabilityScheduleRepository,
                               ParkingSpaceRepository parkingSpaceRepository) {
        this.availabilityScheduleRepository = availabilityScheduleRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
    }

    public List<AvailabilityScheduleResponse> getByParkingSpace(Long parkingSpaceId) {
        return availabilityScheduleRepository.findByParkingSpace_Id(parkingSpaceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AvailabilityScheduleResponse> replaceSchedules(Long parkingSpaceId, List<AvailabilityScheduleRequest> requests) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingSpaceId)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));
        availabilityScheduleRepository.deleteAll(availabilityScheduleRepository.findByParkingSpace_Id(parkingSpaceId));
        List<AvailabilitySchedule> schedules = requests.stream().map(request -> {
            AvailabilitySchedule schedule = new AvailabilitySchedule();
            schedule.setParkingSpace(parkingSpace);
            schedule.setDaysCsv(request.getDaysCsv().toUpperCase(Locale.ROOT));
            schedule.setStartTime(LocalTime.parse(request.getStartTime()));
            schedule.setEndTime(LocalTime.parse(request.getEndTime()));
            return schedule;
        }).collect(Collectors.toList());
        return availabilityScheduleRepository.saveAll(schedules).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public boolean isWithinAvailability(Long parkingSpaceId, LocalDateTime start, LocalDateTime end) {
        List<AvailabilitySchedule> schedules = availabilityScheduleRepository.findByParkingSpace_Id(parkingSpaceId);
        if (schedules.isEmpty()) {
            return true;
        }
        DayOfWeek day = start.getDayOfWeek();
        LocalTime startTime = start.toLocalTime();
        LocalTime endTime = end.toLocalTime();
        return schedules.stream().anyMatch(schedule ->
                schedule.isEnabled()
                        && schedule.getDaysCsv().contains(day.name())
                        && !startTime.isBefore(schedule.getStartTime())
                        && !endTime.isAfter(schedule.getEndTime()));
    }

    private AvailabilityScheduleResponse toResponse(AvailabilitySchedule schedule) {
        AvailabilityScheduleResponse response = new AvailabilityScheduleResponse();
        response.setId(schedule.getId());
        response.setDaysCsv(schedule.getDaysCsv());
        response.setStartTime(schedule.getStartTime().toString());
        response.setEndTime(schedule.getEndTime().toString());
        return response;
    }
}
