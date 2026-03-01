package com.karolina.ride_service.Service;

import com.karolina.ride_service.Entity.Ride;
import com.karolina.ride_service.Enum.RideStatus;
import com.karolina.ride_service.Repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final RestClient restClient;
    private static final double UNLOCK_SCOOTER = 10.0;
    private static final double PRICE_PER_MINUTE = 3.0;

    public RideService(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
        this.restClient = RestClient.create("http://localhost:8082/api/scooters");
    }

    public Ride startRide(Long userId, Long scooterId) {
        List<Ride> activeRides = rideRepository.findByUserIdAndStatus(userId, RideStatus.ONGOING);
        if (!activeRides.isEmpty()) {
            throw new RuntimeException("User already has an ongoing ride!");
        }

        restClient.post()
                .uri("/" + scooterId + "/rent")
                .retrieve()
                .toBodilessEntity();

        Ride ride = Ride.builder()
                .userId(userId)
                .scooterId(scooterId)
                .startTime(LocalDateTime.now())
                .status(RideStatus.ONGOING)
                .build();
        return rideRepository.save(ride);
    }

    public Ride endRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found!"));
        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new RuntimeException("Ride is already completed");
        }
        ride.setEndTime(LocalDateTime.now());
        ride.setStatus(RideStatus.COMPLETED);
        long minRidden = Duration.between(ride.getStartTime(), ride.getEndTime()).toMinutes();
        if (minRidden == 0) {
            minRidden = 1;
        }
        double totalPrice = UNLOCK_SCOOTER + (minRidden * PRICE_PER_MINUTE);
        ride.setPrice(totalPrice);
        String requestBody = """
                {
                    "latitude": 49.8397,
                    "longitude": 24.0297,
                    "distanceRidden": 1.5
                }
                """;

        restClient.post()
                .uri("/" + ride.getScooterId() + "/return")
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
        return rideRepository.save(ride);
    }

    public List<Ride> getUserRideHistory(Long userId) {
        return rideRepository.findByUserId(userId);
    }
}