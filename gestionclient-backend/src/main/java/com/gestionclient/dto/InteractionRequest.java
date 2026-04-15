package com.gestionclient.dto;


import com.gestionclient.enums.TypeInteraction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionRequest {

    @NotNull(message = "Le type d'interaction est obligatoire")
    private TypeInteraction type;

    @NotBlank(message = "Le sujet est obligatoire")
    private String sujet;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;

    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;
}