package com.karolina.scooter_service.DTO;

public record ReturnScooterRequest
        (double latitude, double longitude, double distanceRidden)
{}