package com.karolina.auth_service.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter@Setter
@Table(name="users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    private String email;

    @Column(unique=true, nullable=false)
    private String password;

    private String role;
}
