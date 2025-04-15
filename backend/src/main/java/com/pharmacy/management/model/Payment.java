package com.pharmacy.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDateTime paymentDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String transactionId;
    
    // Additional fields for card payments
    private String cardLastFour;
    private String cardHolderName;

    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        PAYPAL,
        BANK_TRANSFER,
        CASH_ON_DELIVERY
    }

    public enum PaymentStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REFUNDED
    }
} 