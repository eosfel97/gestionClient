package com.gestionclient.service;


import com.gestionclient.dto.DashboardResponse;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.enums.StatutClient;
import com.gestionclient.enums.StatutTache;
import com.gestionclient.enums.TypeInteraction;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.InteractionRepository;
import com.gestionclient.repository.TacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final TacheRepository tacheRepository;
    private final InteractionRepository interactionRepository;
    private final InteractionService interactionService;
    private final TacheService tacheService;

    /**
     * Générer les statistiques du dashboard
     * - Admin : stats globales
     * - Commercial : ses propres stats
     */
    public DashboardResponse getStats(User currentUser) {
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        return DashboardResponse.builder()
                // Compteurs clients
                .totalClients(compterClients(currentUser, isAdmin))
                .clientsActifs(compterClientsParStatut(StatutClient.ACTIF, currentUser, isAdmin))
                .clientsProspects(compterClientsParStatut(StatutClient.PROSPECT, currentUser, isAdmin))
                .clientsInactifs(compterClientsParStatut(StatutClient.INACTIF, currentUser, isAdmin))

                // Compteurs tâches
                .totalTaches(compterTaches(currentUser, isAdmin))
                .tachesAFaire(compterTachesParStatut(StatutTache.A_FAIRE, currentUser, isAdmin))
                .tachesEnCours(compterTachesParStatut(StatutTache.EN_COURS, currentUser, isAdmin))
                .tachesTerminees(compterTachesParStatut(StatutTache.TERMINEE, currentUser, isAdmin))
                .tachesEnRetard(compterTachesEnRetard(currentUser, isAdmin))

                // Compteurs interactions
                .totalInteractions(compterInteractions(currentUser, isAdmin))
                .interactionsCeMois(compterInteractionsCeMois(currentUser, isAdmin))
                .interactionsCetteSemaine(compterInteractionsCetteSemaine(currentUser, isAdmin))

                // Répartitions
                .interactionsParType(repartitionInteractionsParType(currentUser, isAdmin))
                .tachesParPriorite(repartitionTachesParPriorite(currentUser, isAdmin))

                // Activité récente
                .dernieresInteractions(interactionService.interactionsRecentes(currentUser))
                .prochainesTaches(tacheService.tachesAVenir(7, currentUser))
                .tachesEnRetardListe(tacheService.tachesEnRetard(currentUser))
                .build();
    }

    // Compteurs CLIENTS

    private long compterClients(User user, boolean isAdmin) {
        if (isAdmin) {
            return clientRepository.count();
        }
        return clientRepository.countByAssigneAId(user.getId());
    }

    private long compterClientsParStatut(StatutClient statut, User user, boolean isAdmin) {
        if (isAdmin) {
            return clientRepository.countByStatut(statut);
        }
        return clientRepository.countByAssigneAIdAndStatut(user.getId(), statut);
    }

    // Compteurs TÂCHES

    private long compterTaches(User user, boolean isAdmin) {
        if (isAdmin) {
            return tacheRepository.count();
        }
        return tacheRepository.findByAssigneAId(user.getId(),
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
    }

    private long compterTachesParStatut(StatutTache statut, User user, boolean isAdmin) {
        if (isAdmin) {
            return tacheRepository.countByStatut(statut);
        }
        return tacheRepository.countByAssigneAIdAndStatut(user.getId(), statut);
    }

    private long compterTachesEnRetard(User user, boolean isAdmin) {
        if (isAdmin) {
            return tacheRepository.countTachesEnRetard(LocalDate.now());
        }
        return tacheRepository.countTachesEnRetardParUtilisateur(user.getId(), LocalDate.now());
    }

    // Compteurs INTERACTIONS

    private long compterInteractions(User user, boolean isAdmin) {
        if (isAdmin) {
            return interactionRepository.count();
        }
        return interactionRepository.findByAuteurId(user.getId(),
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
    }

    private long compterInteractionsCeMois(User user, boolean isAdmin) {
        LocalDateTime debutMois = LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay();
        LocalDateTime finMois = LocalDateTime.now();

        if (isAdmin) {
            return interactionRepository.countByDateInteractionBetween(debutMois, finMois);
        }
        return interactionRepository.countByAuteurIdAndDateInteractionBetween(
                user.getId(), debutMois, finMois);
    }

    private long compterInteractionsCetteSemaine(User user, boolean isAdmin) {
        LocalDateTime debutSemaine = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay();
        LocalDateTime finSemaine = LocalDateTime.now();

        if (isAdmin) {
            return interactionRepository.countByDateInteractionBetween(debutSemaine, finSemaine);
        }
        return interactionRepository.countByAuteurIdAndDateInteractionBetween(
                user.getId(), debutSemaine, finSemaine);
    }

    // RÉPARTITIONS

    private Map<String, Long> repartitionInteractionsParType(User user, boolean isAdmin) {
        Map<String, Long> repartition = new HashMap<>();

        for (TypeInteraction type : TypeInteraction.values()) {
            long count;
            if (isAdmin) {
                count = interactionRepository.countByType(type);
            } else {
                count = interactionRepository.countByAuteurIdAndType(user.getId(), type);
            }
            repartition.put(type.name(), count);
        }

        return repartition;
    }

    private Map<String, Long> repartitionTachesParPriorite(User user, boolean isAdmin) {
        Map<String, Long> repartition = new HashMap<>();

        for (com.gestionclient.enums.Priorite priorite : com.gestionclient.enums.Priorite.values()) {
            long count;
            if (isAdmin) {
                count = tacheRepository.countByPriorite(priorite);
            } else {
                count = tacheRepository.countByAssigneAIdAndPriorite(user.getId(), priorite);
            }
            repartition.put(priorite.name(), count);
        }

        return repartition;
    }
}