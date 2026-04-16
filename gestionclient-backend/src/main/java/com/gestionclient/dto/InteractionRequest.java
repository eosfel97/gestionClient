package com.gestionclient.dto;


import com.gestionclient.enums.TypeInteraction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @Size(max = 200, message = "Le sujet ne peut pas dépasser 200 caractères")
    private String sujet;

    @NotBlank(message = "Le contenu est obligatoire")
    @Size(max = 5000, message = "Le contenu ne peut pas dépasser 5000 caractères")
    private String contenu;

    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;
}
