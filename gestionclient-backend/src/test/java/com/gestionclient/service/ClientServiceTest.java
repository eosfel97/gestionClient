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

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClientService")
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;



    @Mock
    private InteractionRepository interactionRepository;

    @Mock
    private TacheRepository tacheRepository;

    @InjectMocks
    private ClientService clientService;

    private User commercial;
    private Client client;
    private ClientRequest clientRequest;

    @BeforeEach
    void setUp() {
        commercial = User.builder()
                .id(2L)
                .nom("Dupont")
                .prenom("Jean")
                .email("jean@test.com")
                .role(Role.COMMERCIAL)
                .actif(true)
                .build();

        client = Client.builder()
                .id(1L)
                .nom("Martin")
                .prenom("Pierre")
                .entreprise("TechCorp")
                .email("pierre@techcorp.com")
                .telephone("0612345678")
                .statut(StatutClient.PROSPECT)
                .assigneA(commercial)
                .build();

        clientRequest = ClientRequest.builder()
                .nom("Martin")
                .prenom("Pierre")
                .entreprise("TechCorp")
                .email("pierre@techcorp.com")
                .telephone("0612345678")
                .statut(StatutClient.PROSPECT)
                .build();
    }

    @Nested
    @DisplayName("Création")
    class Creer {

        @Test
        @DisplayName("Doit créer un client avec succès")
        void creer_Success() {
            when(clientRepository.existsByEmail(clientRequest.getEmail())).thenReturn(false);
            when(clientRepository.save(any(Client.class))).thenReturn(client);
            when(interactionRepository.countByClientId(anyLong())).thenReturn(0L);
            when(tacheRepository.findByClientIdOrderByDateEcheanceAsc(anyLong()))
                    .thenReturn(Collections.emptyList());

            ClientResponse response = clientService.creer(clientRequest, commercial);

            assertThat(response).isNotNull();
            assertThat(response.getNom()).isEqualTo("Martin");
            assertThat(response.getEntreprise()).isEqualTo("TechCorp");
            assertThat(response.getStatut()).isEqualTo(StatutClient.PROSPECT);
            assertThat(response.getAssigneANom()).isEqualTo("Dupont");

            verify(clientRepository).save(any(Client.class));
        }

        @Test
        @DisplayName("Doit assigner au commercial connecté par défaut")
        void creer_AssigneParDefaut() {
            when(clientRepository.existsByEmail(any())).thenReturn(false);
            when(clientRepository.save(any(Client.class))).thenReturn(client);
            when(interactionRepository.countByClientId(anyLong())).thenReturn(0L);
            when(tacheRepository.findByClientIdOrderByDateEcheanceAsc(anyLong()))
                    .thenReturn(Collections.emptyList());

            clientService.creer(clientRequest, commercial);

            verify(clientRepository).save(argThat(c -> c.getAssigneA().equals(commercial)));
        }

        @Test
        @DisplayName("Doit échouer si l'email client existe déjà")
        void creer_EmailExistant() {
            when(clientRepository.existsByEmail(clientRequest.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> clientService.creer(clientRequest, commercial))
                    .isInstanceOf(EmailDejaUtiliseException.class);

            verify(clientRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Lecture")
    class Lire {

        @Test
        @DisplayName("Doit trouver un client par ID")
        void trouverParId_Success() {
            when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
            when(interactionRepository.countByClientId(1L)).thenReturn(3L);
            when(tacheRepository.findByClientIdOrderByDateEcheanceAsc(1L))
                    .thenReturn(Collections.emptyList());

            ClientResponse response = clientService.trouverParId(1L, commercial);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getNombreInteractions()).isEqualTo(3);
        }

        @Test
        @DisplayName("Doit lancer une exception si client introuvable")
        void trouverParId_NotFound() {
            when(clientRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> clientService.trouverParId(99L, commercial))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Doit lister tous les clients avec pagination")
        void listerTous_Success() {
            Page<Client> page = new PageImpl<>(List.of(client));
            when(clientRepository.findAll(any(Pageable.class))).thenReturn(page);
            when(interactionRepository.countByClientId(anyLong())).thenReturn(0L);
            when(tacheRepository.findByClientIdOrderByDateEcheanceAsc(anyLong()))
                    .thenReturn(Collections.emptyList());

            PageResponse<ClientResponse> response = clientService.listerTous(0, 10, "dateCreation", "desc");

            assertThat(response.getContenu()).hasSize(1);
            assertThat(response.getTotalElements()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Mise à jour")
    class MettreAJour {

        @Test
        @DisplayName("Doit mettre à jour un client avec succès")
        void mettreAJour_Success() {
            ClientRequest updateRequest = ClientRequest.builder()
                    .nom("Martin")
                    .prenom("Pierre")
                    .entreprise("NewCorp")
                    .email("pierre@techcorp.com")
                    .statut(StatutClient.ACTIF)
                    .build();

            when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
            when(clientRepository.save(any(Client.class))).thenReturn(client);
            when(interactionRepository.countByClientId(anyLong())).thenReturn(0L);
            when(tacheRepository.findByClientIdOrderByDateEcheanceAsc(anyLong()))
                    .thenReturn(Collections.emptyList());

            ClientResponse response = clientService.mettreAJour(1L, updateRequest, commercial);

            assertThat(response).isNotNull();
            verify(clientRepository).save(any(Client.class));
        }

        @Test
        @DisplayName("Doit échouer si le nouvel email existe déjà")
        void mettreAJour_EmailExistant() {
            ClientRequest updateRequest = ClientRequest.builder()
                    .nom("Martin")
                    .prenom("Pierre")
                    .email("autre@email.com")
                    .build();

            when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
            when(clientRepository.existsByEmail("autre@email.com")).thenReturn(true);

            assertThatThrownBy(() -> clientService.mettreAJour(1L, updateRequest, commercial))
                    .isInstanceOf(EmailDejaUtiliseException.class);
        }
    }

    @Nested
    @DisplayName("Suppression")
    class Supprimer {

        @Test
        @DisplayName("Doit supprimer un client existant")
        void supprimer_Success() {
            when(clientRepository.existsById(1L)).thenReturn(true);

            clientService.supprimer(1L);

            verify(clientRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Doit échouer si le client n'existe pas")
        void supprimer_NotFound() {
            when(clientRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> clientService.supprimer(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}