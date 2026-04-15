package com.gestionclient.dto;


import com.gestionclient.enums.Priorite;
import com.gestionclient.enums.StatutTache;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TacheResponse {

    private Long id;
    private String titre;
    private String description;
    private Priorite priorite;
    private StatutTache statut;
    private LocalDate dateEcheance;
    private LocalDateTime dateRappel;
    private boolean enRetard;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;


    private Long clientId;
    private String clientNom;
    private String clientPrenom;
    private String clientEntreprise;


    private Long assigneAId;
    private String assigneANom;
    private String assigneAPrenom;
}