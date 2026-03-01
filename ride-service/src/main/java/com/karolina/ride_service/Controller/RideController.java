package com.karolina.ride_service.Controller;

import com.karolina.ride_service.Entity.Ride;
import com.karolina.ride_service.Service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {
    private final RideService rideService;

    @PostMapping("/start")
    public Ride startRide(@RequestParam Long userId, @RequestParam Long scooterId) {
        return rideService.startRide(userId, scooterId);
    }

    @PostMapping("/{rideId}/end")
    public Ride endRide(@PathVariable Long rideId) {
        return rideService.endRide(rideId);
    }

    @GetMapping("/history/{userId}")
    public List<Ride> getUserHistory(@PathVariable Long userId) {
        return rideService.getUserRideHistory(userId);
    }
}