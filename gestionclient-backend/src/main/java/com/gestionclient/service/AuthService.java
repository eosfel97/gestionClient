package com.gestionclient.service;


import com.gestionclient.dto.AuthResponse;
import com.gestionclient.dto.LoginRequest;
import com.gestionclient.dto.RegisterRequest;
import com.gestionclient.entity.User;
import com.gestionclient.exception.EmailDejaUtiliseException;
import com.gestionclient.repository.UserRepository;
import com.gestionclient.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;


    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailDejaUtiliseException(request.getEmail());
        }

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .actif(true)
                .build();

        User savedUser = userRepository.save(user);


        String token = jwtService.generateToken(
                Map.of("role", savedUser.getRole().name()),
                savedUser
        );

        return buildAuthResponse(savedUser, token);
    }


    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );


        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();


        String token = jwtService.generateToken(
                Map.of("role", user.getRole().name()),
                user
        );

        return buildAuthResponse(user, token);
    }



    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}