package com.gestionclient.controller;


import com.gestionclient.dto.PageResponse;
import com.gestionclient.dto.TacheRequest;
import com.gestionclient.dto.TacheResponse;
import com.gestionclient.entity.User;
import com.gestionclient.enums.StatutTache;
import com.gestionclient.service.TacheService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;

    /**
     * POST /api/taches
     * Créer une nouvelle tâche
     */
    @PostMapping
    public ResponseEntity<TacheResponse> creer(
            @Valid @RequestBody TacheRequest request,
            @AuthenticationPrincipal User currentUser) {

        TacheResponse response = tacheService.creer(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/taches/{id}
     * Récupérer une tâche par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TacheResponse> trouverParId(@PathVariable Long id) {
        TacheResponse response = tacheService.trouverParId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/taches
     * Lister les tâches avec pagination
     */
    @GetMapping
    public ResponseEntity<PageResponse<TacheResponse>> lister(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille,
            @RequestParam(defaultValue = "dateEcheance") String tri,
            @RequestParam(defaultValue = "asc") String direction,
            @AuthenticationPrincipal User currentUser) {

        taille = Math.min(taille, 100);
        PageResponse<TacheResponse> response = tacheService.lister(currentUser, page, taille, tri, direction);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/taches/statut/{statut}
     * Lister les tâches par statut (vue kanban)
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<PageResponse<TacheResponse>> listerParStatut(
            @PathVariable StatutTache statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int taille,
            @AuthenticationPrincipal User currentUser) {

        taille = Math.min(taille, 100);
        PageResponse<TacheResponse> response = tacheService.listerParStatut(statut, currentUser, page, taille);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/taches/client/{clientId}
     * Tâches d'un client spécifique
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<TacheResponse>> listerParClient(@PathVariable Long clientId) {
        List<TacheResponse> response = tacheService.listerParClient(clientId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/taches/en-retard
     * Tâches en retard (dashboard)
     */
    @GetMapping("/en-retard")
    public ResponseEntity<List<TacheResponse>> tachesEnRetard(
            @AuthenticationPrincipal User currentUser) {

        List<TacheResponse> response = tacheService.tachesEnRetard(currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/taches/a-venir?jours=7
     * Tâches à venir dans les prochains jours
     */
    @GetMapping("/a-venir")
    public ResponseEntity<List<TacheResponse>> tachesAVenir(
            @RequestParam(defaultValue = "7") int jours,
            @AuthenticationPrincipal User currentUser) {

        List<TacheResponse> response = tacheService.tachesAVenir(jours, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/taches/{id}
     * Modifier une tâche
     */
    @PutMapping("/{id}")
    public ResponseEntity<TacheResponse> mettreAJour(
            @PathVariable Long id,
            @Valid @RequestBody TacheRequest request,
            @AuthenticationPrincipal User currentUser) {

        TacheResponse response = tacheService.mettreAJour(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/taches/{id}/statut
     * Changer le statut d'une tâche (drag & drop kanban)
     * Body : { "statut" : "EN_COURS" }
     */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<TacheResponse> changerStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {

        String statutStr = body.get("statut");
        StatutTache nouveauStatut;
        try {
            nouveauStatut = StatutTache.valueOf(statutStr != null ? statutStr.toUpperCase() : "");
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Statut invalide. Valeurs acceptées : " + Arrays.toString(StatutTache.values()));
        }
        TacheResponse response = tacheService.changerStatut(id, nouveauStatut, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/taches/{id}
     * Supprimer une tâche
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        tacheService.supprimer(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}