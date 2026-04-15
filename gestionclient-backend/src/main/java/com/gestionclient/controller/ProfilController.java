package com.gestionclient.controller;

import com.gestionclient.dto.ChangePasswordRequest;
import com.gestionclient.dto.ProfilRequest;
import com.gestionclient.dto.UserResponse;
import com.gestionclient.entity.User;
import com.gestionclient.exception.EmailDejaUtiliseException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profil")
@RequiredArgsConstructor
public class ProfilController {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * GET /api/profil
     * Récupérer le profil de l'utilisateur connecté
     */
    @GetMapping
    public ResponseEntity<UserResponse> getProfil(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(toResponse(currentUser));
    }

    /**
     * PUT /api/profil
     * Modifier nom, prénom, email
     */
    @PutMapping
    public ResponseEntity<UserResponse> updateProfil(
            @Valid @RequestBody ProfilRequest request,
            @AuthenticationPrincipal User currentUser) {

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (!request.getEmail().equals(currentUser.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailDejaUtiliseException(request.getEmail());
        }

        currentUser.setNom(request.getNom());
        currentUser.setPrenom(request.getPrenom());
        currentUser.setEmail(request.getEmail());

        User updated = userRepository.save(currentUser);
        return ResponseEntity.ok(toResponse(updated));
    }

    /**
     * PATCH /api/profil/password
     * Changer le mot de passe
     */
    @PatchMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(request.getAncienPassword(), currentUser.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "L'ancien mot de passe est incorrect"));
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNouveauPassword()));
        userRepository.save(currentUser);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .actif(user.isActif())
                .dateCreation(user.getDateCreation())
                .nombreClients(clientRepository.countByAssigneAId(user.getId()))
                .build();
    }
}