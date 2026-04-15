package com.gestionclient.dto;


import com.gestionclient.enums.StatutClient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    private String entreprise;

    @Email(message = "L'email doit être valide")
    private String email;

    private String telephone;

    private String adresse;

    private StatutClient statut;

    private String notes;

    private Long assigneAId;
}