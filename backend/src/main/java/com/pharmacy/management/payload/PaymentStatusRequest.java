package com.pharmacy.management.payload;

import com.pharmacy.management.model.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentStatusRequest {

    @NotNull
    private Payment.PaymentStatus status;
} 