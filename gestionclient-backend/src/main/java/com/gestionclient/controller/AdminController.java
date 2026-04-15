package com.gestionclient.controller;


import com.gestionclient.dto.UserResponse;
import com.gestionclient.enums.Role;
import com.gestionclient.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/users
     * Lister tous les utilisateurs
     */

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listerUtilisateurs() {
        List<UserResponse> response = adminService.listerUtilisateurs();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/users/commerciaux
     * Lister les commerciaux actifs
     */
    @GetMapping("/users/commerciaux")
    public ResponseEntity<List<UserResponse>> listerCommerciaux() {
        List<UserResponse> response = adminService.listerCommerciaux();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/users/{id}
     * Récupérer un utilisateur
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> trouverParId(@PathVariable Long id) {
        UserResponse response = adminService.trouverParId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/users/{id}/toggle-actif
     * Activer / Désactiver un utilisateur
     */
    @PatchMapping("/users/{id}/toggle-actif")
    public ResponseEntity<UserResponse> toggleActif(@PathVariable Long id) {
        UserResponse response = adminService.toggleActif(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/users/{id}/role
     * Changer le rôle d'un utilisateur
     * Body : { "role" : "ADMIN" }
     */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> changerRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Role nouveauRole = Role.valueOf(body.get("role"));
        UserResponse response = adminService.changerRole(id, nouveauRole);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Supprimer un utilisateur
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        adminService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}