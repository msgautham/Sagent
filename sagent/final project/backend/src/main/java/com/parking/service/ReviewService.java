package com.parking.service;

import com.parking.dto.ReviewRequest;
import com.parking.dto.ReviewResponse;
import com.parking.entity.ParkingSpace;
import com.parking.entity.Review;
import com.parking.entity.User;
import com.parking.repository.ParkingSpaceRepository;
import com.parking.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;

    public ReviewService(ReviewRepository reviewRepository, ParkingSpaceRepository parkingSpaceRepository) {
        this.reviewRepository = reviewRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
    }

    public List<ReviewResponse> getByParkingSpace(Long parkingSpaceId) {
        return reviewRepository.findByParkingSpace_Id(parkingSpaceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse create(User buyer, Long parkingSpaceId, ReviewRequest request) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingSpaceId)
                .orElseThrow(() -> new IllegalArgumentException("Parking space not found"));

        Review review = reviewRepository.findByBuyer_IdAndParkingSpace_Id(buyer.getId(), parkingSpaceId)
                .orElseGet(Review::new);
        review.setBuyer(buyer);
        review.setParkingSpace(parkingSpace);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setBuyerName(review.getBuyer().getName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        return response;
    }
}
