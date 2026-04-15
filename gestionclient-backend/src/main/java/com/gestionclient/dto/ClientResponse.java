package com.gestionclient.dto;


import com.gestionclient.enums.StatutClient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String entreprise;
    private String email;
    private String telephone;
    private String adresse;
    private StatutClient statut;
    private String notes;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;


    private Long assigneAId;
    private String assigneANom;
    private String assigneAPrenom;


    private long nombreInteractions;
    private long nombreTaches;
}