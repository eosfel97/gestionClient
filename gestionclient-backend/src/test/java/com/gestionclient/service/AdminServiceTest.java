package com.gestionclient.service;

import com.gestionclient.dto.UserResponse;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.exception.ResourceNotFoundException;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService")
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private AdminService adminService;

    private User admin;
    private User commercial;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .id(1L).nom("Admin").prenom("Super")
                .email("admin@test.com").role(Role.ADMIN).actif(true)
                .build();

        commercial = User.builder()
                .id(2L).nom("Dupont").prenom("Jean")
                .email("jean@test.com").role(Role.COMMERCIAL).actif(true)
                .build();
    }

    @Nested
    @DisplayName("Lister les utilisateurs")
    class Lister {

        @Test
        @DisplayName("Doit lister tous les utilisateurs")
        void listerUtilisateurs_Success() {
            when(userRepository.findAll()).thenReturn(List.of(admin, commercial));
            when(clientRepository.countByAssigneAId(anyLong())).thenReturn(5L);

            List<UserResponse> response = adminService.listerUtilisateurs();

            assertThat(response).hasSize(2);
            assertThat(response.get(0).getNom()).isEqualTo("Admin");
            assertThat(response.get(1).getNom()).isEqualTo("Dupont");
        }

        @Test
        @DisplayName("Doit lister uniquement les commerciaux actifs")
        void listerCommerciaux_Success() {
            when(userRepository.findByRole(Role.COMMERCIAL)).thenReturn(List.of(commercial));
            when(clientRepository.countByAssigneAId(anyLong())).thenReturn(3L);

            List<UserResponse> response = adminService.listerCommerciaux();

            assertThat(response).hasSize(1);
            assertThat(response.getFirst().getRole()).isEqualTo(Role.COMMERCIAL);
            assertThat(response.getFirst().getNombreClients()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Toggle actif")
    class ToggleActif {

        @Test
        @DisplayName("Doit désactiver un utilisateur actif")
        void toggleActif_Desactiver() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(commercial));
            when(userRepository.save(any(User.class))).thenReturn(commercial);
            when(clientRepository.countByAssigneAId(anyLong())).thenReturn(0L);

            adminService.toggleActif(2L);

            verify(userRepository).save(argThat(u -> !u.isActif()));
        }

        @Test
        @DisplayName("Doit échouer si l'utilisateur n'existe pas")
        void toggleActif_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminService.toggleActif(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Changer le rôle")
    class ChangerRole {

        @Test
        @DisplayName("Doit changer le rôle d'un commercial en admin")
        void changerRole_Success() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(commercial));
            when(userRepository.save(any(User.class))).thenReturn(commercial);
            when(clientRepository.countByAssigneAId(anyLong())).thenReturn(0L);

            adminService.changerRole(2L, Role.ADMIN);

            verify(userRepository).save(argThat(u -> u.getRole() == Role.ADMIN));
        }
    }
}