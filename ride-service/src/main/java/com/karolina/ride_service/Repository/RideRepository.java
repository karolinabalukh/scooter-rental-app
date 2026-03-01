package com.karolina.ride_service.Repository;

import com.karolina.ride_service.Entity.Ride;
import com.karolina.ride_service.Enum.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByUserId(Long userId);
    List<Ride> findByUserIdAndStatus(Long userId, RideStatus status);
}
