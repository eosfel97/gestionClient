package com.gestionclient.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailDejaUtiliseException extends RuntimeException {

    public EmailDejaUtiliseException(String email) {
        super(String.format("L'email '%s' est déjà utilisé", email));
    }
}