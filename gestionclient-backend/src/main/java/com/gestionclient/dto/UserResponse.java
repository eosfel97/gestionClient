package com.gestionclient.dto;


import com.gestionclient.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
    private boolean actif;
    private LocalDateTime dateCreation;
    private long nombreClients;
}