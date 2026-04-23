package com.gestionclient.service;

import com.gestionclient.dto.AuthResponse;
import com.gestionclient.dto.LoginRequest;
import com.gestionclient.dto.RegisterRequest;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.exception.EmailDejaUtiliseException;
import com.gestionclient.repository.UserRepository;
import com.gestionclient.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .nom("Dupont")
                .prenom("Jean")
                .email("jean@test.com")
                .password("encodedPassword")
                .role(Role.COMMERCIAL)
                .actif(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .nom("Dupont")
                .prenom("Jean")
                .email("jean@test.com")
                .password("password123")
                .build();

        loginRequest = LoginRequest.builder()
                .email("jean@test.com")
                .password("password123")
                .build();
    }

    @Nested
    @DisplayName("Inscription")
    class Register {

        @Test
        @DisplayName("Doit inscrire un nouvel utilisateur avec succès")
        void register_Success() {

            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
            when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");

            AuthResponse response = authService.register(registerRequest);

            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("jwt-token");
            assertThat(response.getEmail()).isEqualTo("jean@test.com");
            assertThat(response.getNom()).isEqualTo("Dupont");
            assertThat(response.getRole()).isEqualTo(Role.COMMERCIAL);

            verify(userRepository).save(any(User.class));
            verify(passwordEncoder).encode("password123");
        }

        @Test
        @DisplayName("Doit échouer si l'email existe déjà")
        void register_EmailDejaUtilise() {

            when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerRequest))
                    .isInstanceOf(EmailDejaUtiliseException.class);

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Connexion")
    class Login {

        @Test
        @DisplayName("Doit connecter un utilisateur avec succès")
        void login_Success() {

            when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");

            AuthResponse response = authService.login(loginRequest);

            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("jwt-token");
            assertThat(response.getUserId()).isEqualTo(1L);

            verify(authenticationManager).authenticate(
                    any(UsernamePasswordAuthenticationToken.class)
            );
        }

        @Test
        @DisplayName("Doit échouer avec de mauvais identifiants")
        void login_BadCredentials() {

            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(BadCredentialsException.class);
        }
    }
}