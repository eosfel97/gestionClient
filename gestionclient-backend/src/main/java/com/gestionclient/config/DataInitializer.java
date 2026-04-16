package com.gestionclient.config;

import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) {
        String adminEmail = System.getenv("INIT_ADMIN_EMAIL");
        String adminPassword = System.getenv("INIT_ADMIN_PASSWORD");

        if (adminEmail == null || adminPassword == null) {
            log.warn("Variables INIT_ADMIN_EMAIL / INIT_ADMIN_PASSWORD non définies — aucun compte admin initialisé.");
            return;
        }

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .nom("Admin")
                    .prenom("Super")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .actif(true)
                    .build();

            userRepository.save(admin);
            log.info("Compte administrateur initialisé.");
        }
    }
}
