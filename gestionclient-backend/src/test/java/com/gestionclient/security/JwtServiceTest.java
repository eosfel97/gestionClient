package com.gestionclient.security;

import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtService")
class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        ReflectionTestUtils.setField(jwtService, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        user = User.builder()
                .id(1L)
                .nom("Dupont")
                .prenom("Jean")
                .email("jean@test.com")
                .password("encoded")
                .role(Role.COMMERCIAL)
                .actif(true)
                .build();
    }

    @Test
    @DisplayName("Doit générer un token valide")
    void generateToken_Success() {
        String token = jwtService.generateToken(user);

        assertThat(token).isNotNull().isNotEmpty();
    }

    @Test
    @DisplayName("Doit extraire le username (email) du token")
    void extractUsername_Success() {
        String token = jwtService.generateToken(user);

        String username = jwtService.extractUsername(token);

        assertThat(username).isEqualTo("jean@test.com");
    }

    @Test
    @DisplayName("Le token doit être valide pour le bon utilisateur")
    void isTokenValid_Success() {
        String token = jwtService.generateToken(user);

        boolean isValid = jwtService.isTokenValid(token, user);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Le token doit être invalide pour un autre utilisateur")
    void isTokenValid_WrongUser() {
        String token = jwtService.generateToken(user);

        User autreUser = User.builder()
                .id(2L)
                .email("autre@test.com")
                .password("encoded")
                .role(Role.ADMIN)
                .actif(true)
                .build();

        boolean isValid = jwtService.isTokenValid(token, autreUser);

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Un token expiré doit être invalide")
    void isTokenValid_Expired() {
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 0L);

        String token = jwtService.generateToken(user);

        //  délai pour s'assurer que le token est expiré
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}

        boolean isValid;
        try {
            isValid = jwtService.isTokenValid(token, user);
        } catch (Exception e) {
            // Token expiré lance une exception
            isValid = false;
        }

        assertThat(isValid).isFalse();
    }
}