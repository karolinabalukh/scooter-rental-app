package com.karolina.auth_service.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
