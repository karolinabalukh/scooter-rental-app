package com.karolina.scooter_service.Service;

import com.karolina.scooter_service.Entity.Scooter;
import com.karolina.scooter_service.Enum.ScooterStatus;
import com.karolina.scooter_service.Repository.ScooterRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScooterService {
    private final ScooterRepository scooterRepository;

    public List<Scooter> getAllScooter() {
        return scooterRepository.findAll();
    }

    public Scooter getScooterById(Long id) {
        return scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("scooter with id  " + id + " not found"));
    }

    public Scooter getScooterByQrCode(String serialNumber) {
        return scooterRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Invalid QR Code"));
    }

    public List<Scooter> getAvailableScooter() {
        return scooterRepository.findByStatus(ScooterStatus.AVAILABLE);
    }

    public Scooter addScooter(Scooter scooter) {
        scooter.setStatus(ScooterStatus.AVAILABLE);
        return scooterRepository.save(scooter);
    }

    @Transactional
    public void rentScooter(Long id) {
        Scooter scooter = getScooterById(id);
        if (scooter.getStatus() != ScooterStatus.AVAILABLE) {
            throw new RuntimeException("Scooter is not available for rent!");
        }
        if (scooter.getBattery() < 15) {
            throw new RuntimeException("Battery too low to start a ride.");
        }
        scooter.setStatus(ScooterStatus.IN_USE);
        scooterRepository.save(scooter);
    }

    @Transactional
    public void returnScooter(Long id, double newLat, double newLon, double distanceRidden) {
        Scooter scooter = getScooterById(id);
        scooter.setLatitude(newLat);
        scooter.setLongitude(newLon);
        scooter.setMileage(scooter.getMileage() + distanceRidden);
        if (scooter.getBattery() < 15) {
            scooter.setStatus(ScooterStatus.NEEDS_CHARGING);
        } else {
            scooter.setStatus(ScooterStatus.AVAILABLE);
        }
        scooterRepository.save(scooter);
    }

    @Transactional
    public void updateScooter(Long id, double lat, double lon, int battery) {
        Scooter scooter = getScooterById(id);
        scooter.setLatitude(lat);
        scooter.setLongitude(lon);
        scooter.setBattery(battery);
        if (battery <= 10 && scooter.getStatus() == ScooterStatus.AVAILABLE) {
            scooter.setStatus(ScooterStatus.NEEDS_CHARGING);
        }
        scooterRepository.save(scooter);
    }

    @Transactional
    public void sendToMaintenance(Long id) {
        Scooter scooter = getScooterById(id);
        scooter.setStatus(ScooterStatus.IN_MAINTENANCE);
        scooterRepository.save(scooter);
    }

}
