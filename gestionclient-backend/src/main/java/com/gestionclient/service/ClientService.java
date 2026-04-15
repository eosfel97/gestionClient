package com.gestionclient.service;


import com.gestionclient.dto.ClientRequest;
import com.gestionclient.dto.ClientResponse;
import com.gestionclient.dto.PageResponse;
import com.gestionclient.entity.Client;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.enums.StatutClient;
import com.gestionclient.exception.EmailDejaUtiliseException;
import com.gestionclient.exception.ResourceNotFoundException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.InteractionRepository;
import com.gestionclient.repository.TacheRepository;
import com.gestionclient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final InteractionRepository interactionRepository;
    private final TacheRepository tacheRepository;


    @Transactional
    public ClientResponse creer(ClientRequest request, User currentUser) {
        if (request.getEmail() != null && clientRepository.existsByEmail(request.getEmail())) {
            throw new EmailDejaUtiliseException(request.getEmail());
        }

        Client client = Client.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .entreprise(request.getEntreprise())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .statut(request.getStatut() != null ? request.getStatut() : StatutClient.PROSPECT)
                .notes(request.getNotes())
                .build();

        if (request.getAssigneAId() != null) {
            User commercial = userRepository.findById(request.getAssigneAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", request.getAssigneAId()));
            client.setAssigneA(commercial);
        } else {
            client.setAssigneA(currentUser);
        }

        Client saved = clientRepository.save(client);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ClientResponse trouverParId(Long id, User currentUser) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));
        verifierAcces(client, currentUser);
        return toResponse(client);
    }

    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> listerTous(int page, int taille, String tri, String direction) {
        Pageable pageable = creerPageable(page, taille, tri, direction);
        Page<Client> pageClients = clientRepository.findAll(pageable);
        return toPageResponse(pageClients);
    }
    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> listerParCommercial(Long userId, int page, int taille,
                                                            String tri, String direction) {
        Pageable pageable = creerPageable(page, taille, tri, direction);
        Page<Client> pageClients = clientRepository.findByAssigneAId(userId, pageable);
        return toPageResponse(pageClients);
    }
    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> filtrerParStatut(StatutClient statut, User currentUser,
                                                         int page, int taille, String tri, String direction) {
        Pageable pageable = creerPageable(page, taille, tri, direction);
        Page<Client> pageClients;

        if (currentUser.getRole() == Role.ADMIN) {
            pageClients = clientRepository.findByStatut(statut, pageable);
        } else {
            pageClients = clientRepository.findByAssigneAIdAndStatut(currentUser.getId(), statut, pageable);
        }

        return toPageResponse(pageClients);
    }

    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> rechercher(String recherche, User currentUser,
                                                   int page, int taille, String tri, String direction) {
        Pageable pageable = creerPageable(page, taille, tri, direction);
        Page<Client> pageClients;

        if (currentUser.getRole() == Role.ADMIN) {
            pageClients = clientRepository.rechercher(recherche, pageable);
        } else {
            pageClients = clientRepository.rechercherParCommercial(currentUser.getId(), recherche, pageable);
        }

        return toPageResponse(pageClients);
    }

    @Transactional
    public ClientResponse mettreAJour(Long id, ClientRequest request, User currentUser) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));

        verifierAcces(client, currentUser);

        if (request.getEmail() != null
                && !request.getEmail().equals(client.getEmail())
                && clientRepository.existsByEmail(request.getEmail())) {
            throw new EmailDejaUtiliseException(request.getEmail());
        }

        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
        client.setEntreprise(request.getEntreprise());
        client.setEmail(request.getEmail());
        client.setTelephone(request.getTelephone());
        client.setAdresse(request.getAdresse());
        client.setNotes(request.getNotes());

        if (request.getStatut() != null) {
            client.setStatut(request.getStatut());
        }

        if (request.getAssigneAId() != null) {
            User commercial = userRepository.findById(request.getAssigneAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", request.getAssigneAId()));
            client.setAssigneA(commercial);
        }

        Client updated = clientRepository.save(client);
        return toResponse(updated);
    }

    @Transactional
    public void supprimer(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client", id);
        }
        clientRepository.deleteById(id);
    }

    // MAPPING ENTITY → DTO

    private ClientResponse toResponse(Client client) {
        ClientResponse.ClientResponseBuilder builder = ClientResponse.builder()
                .id(client.getId())
                .nom(client.getNom())
                .prenom(client.getPrenom())
                .entreprise(client.getEntreprise())
                .email(client.getEmail())
                .telephone(client.getTelephone())
                .adresse(client.getAdresse())
                .statut(client.getStatut())
                .notes(client.getNotes())
                .dateCreation(client.getDateCreation())
                .dateModification(client.getDateModification())
                .nombreInteractions(interactionRepository.countByClientId(client.getId()))
                .nombreTaches(tacheRepository.findByClientIdOrderByDateEcheanceAsc(client.getId()).size());

        if (client.getAssigneA() != null) {
            builder.assigneAId(client.getAssigneA().getId())
                    .assigneANom(client.getAssigneA().getNom())
                    .assigneAPrenom(client.getAssigneA().getPrenom());
        }

        return builder.build();
    }

    // Utilitaires
    private Pageable creerPageable(int page, int taille, String tri, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(tri).descending()
                : Sort.by(tri).ascending();
        return PageRequest.of(page, taille, sort);
    }

    private PageResponse<ClientResponse> toPageResponse(Page<Client> page) {
        return PageResponse.<ClientResponse>builder()
                .contenu(page.getContent().stream().map(this::toResponse).toList())
                .pageActuelle(page.getNumber())
                .taillePage(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .premiere(page.isFirst())
                .derniere(page.isLast())
                .build();
    }

    private void verifierAcces(Client client, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN
                && !client.getAssigneA().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Vous n'avez pas accès à ce client");
        }
    }
}