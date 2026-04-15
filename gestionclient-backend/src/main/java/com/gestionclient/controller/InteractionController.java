package com.gestionclient.controller;


import com.gestionclient.dto.InteractionRequest;
import com.gestionclient.dto.InteractionResponse;
import com.gestionclient.dto.PageResponse;
import com.gestionclient.entity.User;
import com.gestionclient.enums.TypeInteraction;
import com.gestionclient.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;


    /**
     * POST /api/interactions
     * Créer une nouvelle interaction
     */
    @PostMapping
    public ResponseEntity<InteractionResponse> creer(
            @Valid @RequestBody InteractionRequest request,
            @AuthenticationPrincipal User currentUser) {

        InteractionResponse response = interactionService.creer(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    /**
     * GET /api/interactions/{id}
     * Récupérer une interaction par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InteractionResponse> trouverParId(@PathVariable Long id) {
        InteractionResponse response = interactionService.trouverParId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interactions/client/{clientId}
     * Timeline d'un client (toutes ses interactions)
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<PageResponse<InteractionResponse>> listerParClient(
            @PathVariable Long clientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {

        PageResponse<InteractionResponse> response =
                interactionService.listerParClient(clientId, page, taille);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interactions/client/{clientId}/type/{type}
     * Interactions d'un client filtrées par type
     */
    @GetMapping("/client/{clientId}/type/{type}")
    public ResponseEntity<PageResponse<InteractionResponse>> listerParClientEtType(
            @PathVariable Long clientId,
            @PathVariable TypeInteraction type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {

        PageResponse<InteractionResponse> response =
                interactionService.listerParClientEtType(clientId, type, page, taille);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/interactions/recentes
     * Les 10 interactions les plus récentes (pour le dashboard)
     */
    @GetMapping("/recentes")
    public ResponseEntity<List<InteractionResponse>> interactionsRecentes(
            @AuthenticationPrincipal User currentUser) {

        List<InteractionResponse> response = interactionService.interactionsRecentes(currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/interactions/{id}
     * Modifier une interaction
     */
    @PutMapping("/{id}")
    public ResponseEntity<InteractionResponse> mettreAJour(
            @PathVariable Long id,
            @Valid @RequestBody InteractionRequest request) {

        InteractionResponse response = interactionService.mettreAJour(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/interactions/{id}
     * Supprimer une interaction
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        interactionService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}