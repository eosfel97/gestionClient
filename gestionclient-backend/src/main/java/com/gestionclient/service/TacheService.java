package com.gestionclient.service;



import com.gestionclient.dto.PageResponse;
import com.gestionclient.dto.TacheRequest;
import com.gestionclient.dto.TacheResponse;
import com.gestionclient.entity.Client;
import com.gestionclient.entity.Tache;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Priorite;
import com.gestionclient.enums.Role;
import com.gestionclient.enums.StatutTache;
import com.gestionclient.exception.ResourceNotFoundException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.TacheRepository;
import com.gestionclient.repository.UserRepository;
import com.gestionclient.util.PaginationUtil;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TacheService {

    private final TacheRepository tacheRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;


    @Transactional
    public TacheResponse creer(TacheRequest request, User currentUser) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));

        Tache tache = Tache.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .priorite(request.getPriorite() != null ? request.getPriorite() : Priorite.MOYENNE)
                .statut(request.getStatut() != null ? request.getStatut() : StatutTache.A_FAIRE)
                .dateEcheance(request.getDateEcheance())
                .dateRappel(request.getDateRappel())
                .client(client)
                .build();


        if (request.getAssigneAId() != null) {
            User assignee = userRepository.findById(request.getAssigneAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", request.getAssigneAId()));
            tache.setAssigneA(assignee);
        } else {
            tache.setAssigneA(currentUser);
        }

        Tache saved = tacheRepository.save(tache);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public TacheResponse trouverParId(Long id) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));
        return toResponse(tache);
    }

    /**
     * Lister les tâches avec pagination (filtré par rôle)
     */
    @Transactional(readOnly = true)
    public PageResponse<TacheResponse> lister(User currentUser, int page, int taille,
                                              String tri, String direction) {
        Pageable pageable = creerPageable(page, taille, tri, direction);
        Page<Tache> pageTaches;

        if (currentUser.getRole() == Role.ADMIN) {
            pageTaches = tacheRepository.findAll(pageable);
        } else {
            pageTaches = tacheRepository.findByAssigneAId(currentUser.getId(), pageable);
        }

        return toPageResponse(pageTaches);
    }

    /**
     * Lister les tâches par statut (pour la vue kanban)
     */
    @Transactional(readOnly = true)
    public PageResponse<TacheResponse> listerParStatut(StatutTache statut, User currentUser,
                                                       int page, int taille) {
        Pageable pageable = PaginationUtil.creerPageable(page, taille, Sort.by("dateEcheance").ascending());
        Page<Tache> pageTaches;

        if (currentUser.getRole() == Role.ADMIN) {
            pageTaches = tacheRepository.findByStatut(statut, pageable);
        } else {
            pageTaches = tacheRepository.findByAssigneAIdAndStatut(currentUser.getId(), statut, pageable);
        }

        return toPageResponse(pageTaches);
    }

    /**
     * Tâches d'un client spécifique
     */
    @Transactional(readOnly = true)
    public List<TacheResponse> listerParClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client", clientId);
        }

        return tacheRepository.findByClientIdOrderByDateEcheanceAsc(clientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Tâches en retard (dashboard)
     */
    @Transactional(readOnly = true)
    public List<TacheResponse> tachesEnRetard(User currentUser) {
        List<Tache> taches;

        if (currentUser.getRole() == Role.ADMIN) {
            taches = tacheRepository.findTachesEnRetard(LocalDate.now());
        } else {
            taches = tacheRepository.findTachesEnRetardParUtilisateur(currentUser.getId(), LocalDate.now());
        }

        return taches.stream().map(this::toResponse).toList();
    }

    /**
     * Tâches à venir dans les X prochains jours
     */
    @Transactional(readOnly = true)
    public List<TacheResponse> tachesAVenir(int jours, User currentUser) {
        LocalDate debut = LocalDate.now();
        LocalDate fin = debut.plusDays(jours);

        List<Tache> taches = tacheRepository.findTachesAVenir(debut, fin);


        if (currentUser.getRole() != Role.ADMIN) {
            taches = taches.stream()
                    .filter(t -> t.getAssigneA().getId().equals(currentUser.getId()))
                    .toList();
        }

        return taches.stream().map(this::toResponse).toList();
    }



    @Transactional
    public TacheResponse mettreAJour(Long id, TacheRequest request, User currentUser) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));

        if (currentUser.getRole() != Role.ADMIN) {
            if (tache.getAssigneA() == null || !tache.getAssigneA().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Vous ne pouvez modifier que vos propres tâches");
            }
        }

        tache.setTitre(request.getTitre());
        tache.setDescription(request.getDescription());
        tache.setDateEcheance(request.getDateEcheance());
        tache.setDateRappel(request.getDateRappel());

        if (request.getPriorite() != null) {
            tache.setPriorite(request.getPriorite());
        }
        if (request.getStatut() != null) {
            tache.setStatut(request.getStatut());
        }


        if (!tache.getClient().getId().equals(request.getClientId())) {
            Client newClient = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
            tache.setClient(newClient);
        }


        if (request.getAssigneAId() != null && !tache.getAssigneA().getId().equals(request.getAssigneAId())) {
            User newAssignee = userRepository.findById(request.getAssigneAId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", request.getAssigneAId()));
            tache.setAssigneA(newAssignee);
        }

        Tache updated = tacheRepository.save(tache);
        return toResponse(updated);
    }

    /**
     * Changer uniquement le statut d'une tâche (pratique pour le drag & drop kanban)
     */
    @Transactional
    public TacheResponse changerStatut(Long id, StatutTache nouveauStatut, User currentUser) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));

        if (currentUser.getRole() != Role.ADMIN) {
            if (tache.getAssigneA() == null || !tache.getAssigneA().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Vous ne pouvez modifier que vos propres tâches");
            }
        }

        tache.setStatut(nouveauStatut);
        Tache updated = tacheRepository.save(tache);
        return toResponse(updated);
    }



    @Transactional
    public void supprimer(Long id, User currentUser) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche", id));

        if (currentUser.getRole() != Role.ADMIN) {
            if (tache.getAssigneA() == null || !tache.getAssigneA().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Vous ne pouvez supprimer que vos propres tâches");
            }
        }

        tacheRepository.deleteById(id);
    }

    // APPING ENTITY → DTO

    private TacheResponse toResponse(Tache tache) {
        TacheResponse.TacheResponseBuilder builder = TacheResponse.builder()
                .id(tache.getId())
                .titre(tache.getTitre())
                .description(tache.getDescription())
                .priorite(tache.getPriorite())
                .statut(tache.getStatut())
                .dateEcheance(tache.getDateEcheance())
                .dateRappel(tache.getDateRappel())
                .enRetard(tache.isEnRetard())
                .dateCreation(tache.getDateCreation())
                .dateModification(tache.getDateModification());

        if (tache.getClient() != null) {
            builder.clientId(tache.getClient().getId())
                    .clientNom(tache.getClient().getNom())
                    .clientPrenom(tache.getClient().getPrenom())
                    .clientEntreprise(tache.getClient().getEntreprise());
        }

        if (tache.getAssigneA() != null) {
            builder.assigneAId(tache.getAssigneA().getId())
                    .assigneANom(tache.getAssigneA().getNom())
                    .assigneAPrenom(tache.getAssigneA().getPrenom());
        }

        return builder.build();
    }

    // UTILITAIRES

    private Pageable creerPageable(int page, int taille, String tri, String direction) {
        return PaginationUtil.creerPageable(page, taille, tri, direction);
    }

    private PageResponse<TacheResponse> toPageResponse(Page<Tache> page) {
        return PageResponse.<TacheResponse>builder()
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