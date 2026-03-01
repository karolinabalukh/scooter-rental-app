package com.karolina.scooter_service.DTO;

public record TelemetryRequest
        (double latitude, double longitude, int batteryLevel)
{ }