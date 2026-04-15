package com.gestionclient.service;


import com.gestionclient.dto.UserResponse;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.exception.ResourceNotFoundException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    /**
     * Lister tous les utilisateurs
     */
    public List<UserResponse> listerUtilisateurs() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lister les commerciaux actifs
     */
    public List<UserResponse> listerCommerciaux() {
        return userRepository.findByRole(Role.COMMERCIAL).stream()
                .filter(User::isActif)
                .map(this::toResponse)
                .toList();
    }

    /**
     * Récupérer un utilisateur par son ID
     */
    public UserResponse trouverParId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
        return toResponse(user);
    }

    /**
     * Activer / Désactiver un utilisateur
     */
    @Transactional
    public UserResponse toggleActif(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));

        user.setActif(!user.isActif());
        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    /**
     * Changer le rôle d'un utilisateur
     */
    @Transactional
    public UserResponse changerRole(Long id, Role nouveauRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));

        user.setRole(nouveauRole);
        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    /**
     * Supprimer un utilisateur
     */
    @Transactional
    public void supprimer(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", id);
        }
        userRepository.deleteById(id);
    }

    // MAPPING

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