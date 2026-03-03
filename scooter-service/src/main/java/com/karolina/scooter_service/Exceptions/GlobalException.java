package com.karolina.scooter_service.Exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalException {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateScooter(DataIntegrityViolationException ex) {
        Map<String, String> mapError = new HashMap<>();
        mapError.put("error", "Saving error");
        mapError.put("message", "A scooter with this serial number already exists in the database.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapError);
    }
}
