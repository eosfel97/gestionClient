package com.gestionclient.dto;


import com.gestionclient.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
}