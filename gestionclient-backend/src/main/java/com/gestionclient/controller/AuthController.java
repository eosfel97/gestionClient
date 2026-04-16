package com.gestionclient.controller;


import com.gestionclient.dto.AuthResponse;
import com.gestionclient.dto.LoginRequest;
import com.gestionclient.dto.RegisterRequest;
import com.gestionclient.exception.TooManyRequestsException;
import com.gestionclient.service.AuthService;
import com.gestionclient.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final LoginAttemptService loginAttemptService;


    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();

        if (loginAttemptService.isBlocked(ip)) {
            log.warn("Login bloqué (trop de tentatives) pour IP : {}", ip);
            throw new TooManyRequestsException("Trop de tentatives de connexion. Réessayez dans 1 minute.");
        }

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            loginAttemptService.registerFailedAttempt(ip);
            log.warn("Échec de connexion depuis IP={}", ip);
            throw e;
        }
    }
}