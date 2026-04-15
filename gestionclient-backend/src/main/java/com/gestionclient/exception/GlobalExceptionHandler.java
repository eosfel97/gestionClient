package com.gestionclient.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @Data
    @Builder
    @AllArgsConstructor
    public static class ErrorResponse {
        private int status;
        private String message;
        private LocalDateTime timestamp;
        private Map<String, String> errors;
    }


    /**
     * Ressource non trouvée (404)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Email déjà utilisé (409)
     */
    @ExceptionHandler(EmailDejaUtiliseException.class)
    public ResponseEntity<ErrorResponse> handleEmailDejaUtilise(EmailDejaUtiliseException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    /**
     * Identifiants incorrects (401)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
    }

    /**
     * Erreurs de validation (@Valid) (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Erreur de validation")
                .timestamp(LocalDateTime.now())
                .errors(errors)
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Accès refusé (403)
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Accès refusé : vous n'avez pas les droits nécessaires");
    }

    /**
     * Erreur générique (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Une erreur interne est survenue : " + ex.getMessage());
    }
    

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message) {
        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, status);
    }
}