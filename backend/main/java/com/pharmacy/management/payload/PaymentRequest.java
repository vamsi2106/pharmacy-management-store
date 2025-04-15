package com.pharmacy.management.payload;

import com.pharmacy.management.model.Payment;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {

    @NotNull
    private Long orderId;
    
    @NotNull
    @Positive
    private BigDecimal amount;
    
    @NotNull
    private Payment.PaymentMethod paymentMethod;
    
    // Additional fields for different payment methods
    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;
    
    // For PayPal
    private String paypalEmail;
    
    // For bank transfer
    private String bankAccount;
} 