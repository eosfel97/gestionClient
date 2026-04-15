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

        if (userRepository.findByEmail("admin@gestionclient.com").isEmpty()) {
            User admin = User.builder()
                    .nom("Admin")
                    .prenom("Super")
                    .email("admin@gestionclient.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .actif(true)
                    .build();

            userRepository.save(admin);
            log.info("Utilisateur admin créé : admin@gestionclient.com / admin123");
        }
        if (userRepository.findByEmail("commercial@gestionclient.com").isEmpty()) {
            User commercial = User.builder()
                    .nom("Dupont")
                    .prenom("Jean")
                    .email("commercial@gestionclient.com")
                    .password(passwordEncoder.encode("commercial123"))
                    .role(Role.COMMERCIAL)
                    .actif(true)
                    .build();
            userRepository.save(commercial);
            log.info("Utilisateur commercial créé : commercial@gestionclient.com / commercial123");
        }
    }
}