package com.pharmacy.management.exception;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Map;

@Getter
@Setter
public class ValidationErrorResponse extends ErrorResponse {
    private Map<String, String> errors;
    
    public ValidationErrorResponse(Date timestamp, int status, String error, String message, Map<String, String> errors) {
        super(timestamp, status, error, message, null);
        this.errors = errors;
    }
} 