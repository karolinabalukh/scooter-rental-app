package com.karolina.scooter_service.Entity;

import com.karolina.scooter_service.Enum.ScooterStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "scooters")
public class Scooter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String serialNumber;

    @Column(nullable = false)
    private int battery;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScooterStatus status;

    private double latitude;
    private double longitude;
    private double mileage;
}
