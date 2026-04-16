package com.gestionclient.controller;


import com.gestionclient.dto.ClientRequest;
import com.gestionclient.dto.ClientResponse;
import com.gestionclient.dto.PageResponse;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.enums.StatutClient;
import com.gestionclient.service.ClientService;
import com.gestionclient.util.PaginationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private static final Set<String> CHAMPS_TRI = Set.of(
            "nom", "prenom", "entreprise", "email", "dateCreation", "statut");

    private final ClientService clientService;


    /**
     * POST /api/clients
     * Créer un nouveau client
     */
    @PostMapping
    public ResponseEntity<ClientResponse> creer(
            @Valid @RequestBody ClientRequest request,
            @AuthenticationPrincipal User currentUser) {

        ClientResponse response = clientService.creer(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    /**
     * GET /api/clients/{id}
     * Récupérer un client par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> trouverParId(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        ClientResponse response = clientService.trouverParId(id, currentUser);
        return ResponseEntity.ok(response);
    }
    /**
     * GET /api/clients
     * Lister les clients avec pagination et tri
     * - Admin : voit tous les clients
     * - Commercial : voit uniquement ses clients
     */
    @GetMapping
    public ResponseEntity<PageResponse<ClientResponse>> lister(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille,
            @RequestParam(defaultValue = "dateCreation") String tri,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal User currentUser) {

        taille = Math.min(taille, 100);
        tri = PaginationUtil.validerTri(tri, CHAMPS_TRI, "dateCreation");
        PageResponse<ClientResponse> response;

        if (currentUser.getRole() == Role.ADMIN) {
            response = clientService.listerTous(page, taille, tri, direction);
        } else {
            response = clientService.listerParCommercial(currentUser.getId(), page, taille, tri, direction);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/clients/statut/{statut}
     * Filtrer les clients par statut
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<PageResponse<ClientResponse>> filtrerParStatut(
            @PathVariable StatutClient statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille,
            @RequestParam(defaultValue = "dateCreation") String tri,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal User currentUser) {

        taille = Math.min(taille, 100);
        tri = PaginationUtil.validerTri(tri, CHAMPS_TRI, "dateCreation");
        PageResponse<ClientResponse> response = clientService.filtrerParStatut(statut, currentUser, page, taille, tri, direction);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/clients/recherche ?q=...
     * Rechercher des clients (nom, prénom, entreprise, email)
     */
    @GetMapping("/recherche")
    public ResponseEntity<PageResponse<ClientResponse>> rechercher(
            @RequestParam("q") String recherche,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille,
            @RequestParam(defaultValue = "nom") String tri,
            @RequestParam(defaultValue = "asc") String direction,
            @AuthenticationPrincipal User currentUser) {

        taille = Math.min(taille, 100);
        tri = PaginationUtil.validerTri(tri, CHAMPS_TRI, "nom");
        PageResponse<ClientResponse> response = clientService.rechercher(
                recherche, currentUser, page, taille, tri, direction);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/clients/{id}
     * Modifier un client
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> mettreAJour(
            @PathVariable Long id,
            @Valid @RequestBody ClientRequest request,
            @AuthenticationPrincipal User currentUser) {

        ClientResponse response = clientService.mettreAJour(id, request, currentUser);
        return ResponseEntity.ok(response);
    }


    /**
     * DELETE /api/clients/{id}
     * Supprimer un client (admin uniquement, configuré dans SecurityConfig)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        clientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}