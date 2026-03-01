package com.karolina.ride_service.Entity;

import com.karolina.ride_service.Enum.RideStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long scooterId;

    @Column(nullable = false)
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;
}
