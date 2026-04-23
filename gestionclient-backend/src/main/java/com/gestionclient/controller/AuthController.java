package com.gestionclient.controller;

import com.gestionclient.dto.AuthResponse;
import com.gestionclient.dto.LoginRequest;
import com.gestionclient.dto.RegisterRequest;
import com.gestionclient.exception.TooManyRequestsException;
import com.gestionclient.service.AuthService;
import com.gestionclient.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final LoginAttemptService loginAttemptService;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        response.setToken(null);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String ip = extractClientIp(httpRequest);

        if (loginAttemptService.isBlocked(ip)) {
            log.warn("Login bloqué (trop de tentatives) pour IP : {}", ip);
            throw new TooManyRequestsException("Trop de tentatives de connexion. Réessayez dans 1 minute.");
        }

        try {
            AuthResponse response = authService.login(request);

            ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofMillis(jwtExpiration))
                    .sameSite("Lax")
                    // .secure(true) — décommenter en production (HTTPS uniquement)
                    .build();
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            response.setToken(null);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            loginAttemptService.registerFailedAttempt(ip);
            log.warn("Échec de connexion depuis IP={}", ip);
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse httpResponse) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
