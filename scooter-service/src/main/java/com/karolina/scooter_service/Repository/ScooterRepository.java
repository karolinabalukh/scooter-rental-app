package com.karolina.scooter_service.Repository;

import com.karolina.scooter_service.Entity.Scooter;
import com.karolina.scooter_service.Enum.ScooterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScooterRepository extends JpaRepository<Scooter, Long> {

    List<Scooter> findByStatus(ScooterStatus status);

    Optional<Scooter> findBySerialNumber(String serialNumber);

    @Query("SELECT s FROM Scooter s WHERE s.battery < :level")
    List<Scooter> findByBatteryLevelLessThan(@Param("level") int level);
}