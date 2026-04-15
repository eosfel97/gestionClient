package com.gestionclient.service;

import com.gestionclient.dto.PageResponse;
import com.gestionclient.dto.TacheRequest;
import com.gestionclient.dto.TacheResponse;
import com.gestionclient.entity.Client;
import com.gestionclient.entity.Tache;
import com.gestionclient.entity.User;
import com.gestionclient.enums.*;
import com.gestionclient.exception.ResourceNotFoundException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.TacheRepository;
import com.gestionclient.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TacheService")
class TacheServiceTest {

    @Mock
    private TacheRepository tacheRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TacheService tacheService;

    private User commercial;
    private User admin;
    private Client client;
    private Tache tache;
    private TacheRequest tacheRequest;

    @BeforeEach
    void setUp() {
        commercial = User.builder()
                .id(1L).nom("Dupont").prenom("Jean")
                .email("jean@test.com").role(Role.COMMERCIAL).actif(true)
                .build();

        admin = User.builder()
                .id(2L).nom("Admin").prenom("Super")
                .email("admin@test.com").role(Role.ADMIN).actif(true)
                .build();

        client = Client.builder()
                .id(1L).nom("Martin").prenom("Pierre")
                .entreprise("TechCorp").statut(StatutClient.ACTIF)
                .build();

        tache = Tache.builder()
                .id(1L)
                .titre("Relance devis")
                .description("Relancer Pierre pour le devis")
                .priorite(Priorite.HAUTE)
                .statut(StatutTache.A_FAIRE)
                .dateEcheance(LocalDate.now().plusDays(3))
                .client(client)
                .assigneA(commercial)
                .build();

        tacheRequest = TacheRequest.builder()
                .titre("Relance devis")
                .description("Relancer Pierre pour le devis")
                .priorite(Priorite.HAUTE)
                .dateEcheance(LocalDate.now().plusDays(3))
                .clientId(1L)
                .build();
    }

    @Nested
    @DisplayName("Création")
    class Creer {

        @Test
        @DisplayName("Doit créer une tâche avec succès")
        void creer_Success() {
            when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
            when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

            TacheResponse response = tacheService.creer(tacheRequest, commercial);

            assertThat(response).isNotNull();
            assertThat(response.getTitre()).isEqualTo("Relance devis");
            assertThat(response.getPriorite()).isEqualTo(Priorite.HAUTE);
            assertThat(response.getStatut()).isEqualTo(StatutTache.A_FAIRE);
            assertThat(response.isEnRetard()).isFalse();
            assertThat(response.getAssigneANom()).isEqualTo("Dupont");

            verify(tacheRepository).save(any(Tache.class));
        }

        @Test
        @DisplayName("Doit échouer si le client n'existe pas")
        void creer_ClientNotFound() {
            when(clientRepository.findById(99L)).thenReturn(Optional.empty());
            tacheRequest.setClientId(99L);

            assertThatThrownBy(() -> tacheService.creer(tacheRequest, commercial))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Lecture")
    class Lire {

        @Test
        @DisplayName("Admin doit voir toutes les tâches")
        void lister_Admin() {
            Page<Tache> page = new PageImpl<>(List.of(tache));
            when(tacheRepository.findAll(any(Pageable.class))).thenReturn(page);

            PageResponse<TacheResponse> response = tacheService.lister(admin, 0, 10, "dateEcheance", "asc");

            assertThat(response.getContenu()).hasSize(1);
            verify(tacheRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("Commercial doit voir uniquement ses tâches")
        void lister_Commercial() {
            Page<Tache> page = new PageImpl<>(List.of(tache));
            when(tacheRepository.findByAssigneAId(anyLong(), any(Pageable.class))).thenReturn(page);

            PageResponse<TacheResponse> response = tacheService.lister(commercial, 0, 10, "dateEcheance", "asc");

            assertThat(response.getContenu()).hasSize(1);
            verify(tacheRepository).findByAssigneAId(eq(1L), any(Pageable.class));
        }

        @Test
        @DisplayName("Doit retourner les tâches d'un client")
        void listerParClient_Success() {
            when(clientRepository.existsById(1L)).thenReturn(true);
            when(tacheRepository.findByClientIdOrderByDateEcheanceAsc(1L))
                    .thenReturn(List.of(tache));

            List<TacheResponse> response = tacheService.listerParClient(1L);

            assertThat(response).hasSize(1);
            assertThat(response.get(0).getTitre()).isEqualTo("Relance devis");
        }

        @Test
        @DisplayName("Doit retourner les tâches en retard")
        void tachesEnRetard_Admin() {
            Tache tacheEnRetard = Tache.builder()
                    .id(2L).titre("Tâche en retard")
                    .priorite(Priorite.HAUTE).statut(StatutTache.A_FAIRE)
                    .dateEcheance(LocalDate.now().minusDays(5))
                    .client(client).assigneA(commercial)
                    .build();

            when(tacheRepository.findTachesEnRetard(any(LocalDate.class)))
                    .thenReturn(List.of(tacheEnRetard));

            List<TacheResponse> response = tacheService.tachesEnRetard(admin);

            assertThat(response).hasSize(1);
            assertThat(response.get(0).isEnRetard()).isTrue();
        }
    }

    @Nested
    @DisplayName("Changement de statut")
    class ChangerStatut {

        @Test
        @DisplayName("Doit changer le statut (kanban)")
        void changerStatut_Success() {
            when(tacheRepository.findById(1L)).thenReturn(Optional.of(tache));
            when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

            TacheResponse response = tacheService.changerStatut(1L, StatutTache.EN_COURS);

            verify(tacheRepository).save(argThat(t -> t.getStatut() == StatutTache.EN_COURS));
        }

        @Test
        @DisplayName("Doit échouer si la tâche n'existe pas")
        void changerStatut_NotFound() {
            when(tacheRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tacheService.changerStatut(99L, StatutTache.TERMINEE))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Suppression")
    class Supprimer {

        @Test
        @DisplayName("Doit supprimer une tâche existante")
        void supprimer_Success() {
            when(tacheRepository.existsById(1L)).thenReturn(true);

            tacheService.supprimer(1L);

            verify(tacheRepository).deleteById(1L);
        }
    }
}