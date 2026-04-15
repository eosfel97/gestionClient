package com.gestionclient.dto;


import com.gestionclient.enums.TypeInteraction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionResponse {

    private Long id;
    private TypeInteraction type;
    private String sujet;
    private String contenu;
    private LocalDateTime dateInteraction;


    private Long clientId;
    private String clientNom;
    private String clientPrenom;
    private String clientEntreprise;


    private Long auteurId;
    private String auteurNom;
    private String auteurPrenom;
}