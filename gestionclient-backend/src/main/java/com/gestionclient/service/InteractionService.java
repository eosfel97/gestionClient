package com.gestionclient.service;


import com.gestionclient.dto.InteractionRequest;
import com.gestionclient.dto.InteractionResponse;
import com.gestionclient.dto.PageResponse;
import com.gestionclient.entity.Client;
import com.gestionclient.entity.Interaction;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.enums.TypeInteraction;
import com.gestionclient.exception.ResourceNotFoundException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.InteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final ClientRepository clientRepository;



    @Transactional
    public InteractionResponse creer(InteractionRequest request, User currentUser) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));

        Interaction interaction = Interaction.builder()
                .type(request.getType())
                .sujet(request.getSujet())
                .contenu(request.getContenu())
                .client(client)
                .auteur(currentUser)
                .build();

        Interaction saved = interactionRepository.save(interaction);
        return toResponse(saved);
    }



    public InteractionResponse trouverParId(Long id) {
        Interaction interaction = interactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interaction", id));
        return toResponse(interaction);
    }

    /**
     * Timeline d'un client : toutes ses interactions triées par date décroissante
     */
    @Transactional(readOnly = true)
    public PageResponse<InteractionResponse> listerParClient(Long clientId, int page, int taille) {

        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client", clientId);
        }

        Pageable pageable = PageRequest.of(page, taille);
        Page<Interaction> pageInteractions =
                interactionRepository.findByClientIdOrderByDateInteractionDesc(clientId, pageable);
        return toPageResponse(pageInteractions);
    }

    /**
     * Filtrer les interactions d'un client par type
     */
    @Transactional(readOnly = true)
    public PageResponse<InteractionResponse> listerParClientEtType(Long clientId, TypeInteraction type,
                                                                   int page, int taille) {
        Pageable pageable = PageRequest.of(page, taille);
        Page<Interaction> pageInteractions =
                interactionRepository.findByClientIdAndType(clientId, type, pageable);
        return toPageResponse(pageInteractions);
    }

    /**
     * Interactions récentes (pour le dashboard)
     */
    @Transactional(readOnly = true)
    public List<InteractionResponse> interactionsRecentes(User currentUser) {
        List<Interaction> interactions;

        if (currentUser.getRole() == Role.ADMIN) {
            interactions = interactionRepository.findTop10ByOrderByDateInteractionDesc();
        } else {
            interactions = interactionRepository.findTop10ByAuteurIdOrderByDateInteractionDesc(currentUser.getId());
        }

        return interactions.stream().map(this::toResponse).toList();
    }



    @Transactional
    public InteractionResponse mettreAJour(Long id, InteractionRequest request) {
        Interaction interaction = interactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interaction", id));

        interaction.setType(request.getType());
        interaction.setSujet(request.getSujet());
        interaction.setContenu(request.getContenu());


        if (!interaction.getClient().getId().equals(request.getClientId())) {
            Client newClient = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
            interaction.setClient(newClient);
        }

        Interaction updated = interactionRepository.save(interaction);
        return toResponse(updated);
    }



    @Transactional
    public void supprimer(Long id) {
        if (!interactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Interaction", id);
        }
        interactionRepository.deleteById(id);
    }

    // MAPPING ENTITY → DTO

    private InteractionResponse toResponse(Interaction interaction) {
        InteractionResponse.InteractionResponseBuilder builder = InteractionResponse.builder()
                .id(interaction.getId())
                .type(interaction.getType())
                .sujet(interaction.getSujet())
                .contenu(interaction.getContenu())
                .dateInteraction(interaction.getDateInteraction());

        if (interaction.getClient() != null) {
            builder.clientId(interaction.getClient().getId())
                    .clientNom(interaction.getClient().getNom())
                    .clientPrenom(interaction.getClient().getPrenom())
                    .clientEntreprise(interaction.getClient().getEntreprise());
        }

        if (interaction.getAuteur() != null) {
            builder.auteurId(interaction.getAuteur().getId())
                    .auteurNom(interaction.getAuteur().getNom())
                    .auteurPrenom(interaction.getAuteur().getPrenom());
        }

        return builder.build();
    }

    private PageResponse<InteractionResponse> toPageResponse(Page<Interaction> page) {
        return PageResponse.<InteractionResponse>builder()
                .contenu(page.getContent().stream().map(this::toResponse).toList())
                .pageActuelle(page.getNumber())
                .taillePage(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .premiere(page.isFirst())
                .derniere(page.isLast())
                .build();
    }
}