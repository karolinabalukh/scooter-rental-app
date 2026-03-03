package com.karolina.scooter_service.Controller;

import com.karolina.scooter_service.DTO.ReturnScooterRequest;
import com.karolina.scooter_service.DTO.TelemetryRequest;
import com.karolina.scooter_service.Entity.Scooter;
import com.karolina.scooter_service.Service.ScooterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scooters")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ScooterController {
    private final ScooterService scooterService;

    @GetMapping
    public List<Scooter> getAllScooters() {
        return scooterService.getAllScooter();
    }

    @GetMapping("/{id}")
    public Scooter getScooterById(@PathVariable Long id) {
        return scooterService.getScooterById(id);
    }

    @GetMapping("/available")
    public List<Scooter> getAvailableScooters() {
        return scooterService.getAvailableScooter();
    }

    @PutMapping("/{id}/telemetry")
    public ResponseEntity<String> updateTelemetry(@PathVariable Long id, @RequestBody TelemetryRequest request) {
        scooterService.updateScooter(id, request.latitude(), request.longitude(), request.batteryLevel());
        return ResponseEntity.ok("successful returned");
    }

    @GetMapping("/qr/{serialNumber}")
    public Scooter getScooterByQr(@PathVariable String serialNumber) {
        return scooterService.getScooterByQrCode(serialNumber);
    }

    @PostMapping("/{id}/rent")
    public ResponseEntity<String> rentScooter(@PathVariable Long id) {
        scooterService.rentScooter(id);
        return ResponseEntity.ok("successful rented");
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<String> returnScooter(@PathVariable Long id, @RequestBody ReturnScooterRequest request) {
        scooterService.returnScooter(id, request.latitude(), request.longitude(), request.distanceRidden());
        return ResponseEntity.ok("Scooter successfully returned");
    }


    @PostMapping
    public Scooter addScooter(@RequestBody Scooter scooter) {
        return scooterService.addScooter(scooter);
    }

    @PutMapping("/{id}/maintenance")
    public ResponseEntity<String> sendToMaintenance(@PathVariable Long id) {
        scooterService.sendToMaintenance(id);
        return ResponseEntity.ok("maintenance sent");
    }
}
