package com.gestionclient.config;

import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.jspecify.annotations.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final int MIN_PASSWORD_LENGTH = 12;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${INIT_ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${INIT_ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run( String @NonNull ... args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("Variables INIT_ADMIN_EMAIL / INIT_ADMIN_PASSWORD non definies - aucun compte admin initialise.");
            return;
        }

        if (adminPassword.length() < MIN_PASSWORD_LENGTH) {
            log.error("Le mot de passe admin doit contenir au moins {} caracteres. Initialisation annulee.",
                    MIN_PASSWORD_LENGTH);
            return;
        }

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.debug("Un compte admin avec l'email {} existe deja. Aucune action.", adminEmail);
            return;
        }

        User admin = User.builder()
                .nom("Admin")
                .prenom("Super")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .actif(true)
                .build();

        userRepository.save(admin);
        log.info("Compte administrateur initialise pour l'email {}.", adminEmail);
    }
}