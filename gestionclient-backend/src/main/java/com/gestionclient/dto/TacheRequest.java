package com.gestionclient.dto;


import com.gestionclient.enums.Priorite;
import com.gestionclient.enums.StatutTache;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class TacheRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String description;

    private Priorite priorite;

    private StatutTache statut;

    private LocalDate dateEcheance;

    private LocalDateTime dateRappel;

    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;

    private Long assigneAId;
}