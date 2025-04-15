package com.pharmacy.management.controller;

import com.pharmacy.management.model.Payment;
import com.pharmacy.management.payload.PaymentRequest;
import com.pharmacy.management.payload.PaymentStatusRequest;
import com.pharmacy.management.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST') or @securityService.isPaymentOwner(authentication, #id)")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST') or @securityService.isOrderOwner(authentication, #orderId)")
    public ResponseEntity<Payment> getPaymentByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrder(orderId));
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Payment> processPayment(
            @Valid @RequestBody PaymentRequest paymentRequest) {
        
        try {
            // Convert the DTO to an entity
            Payment payment = new Payment();
            payment.setAmount(paymentRequest.getAmount());
            payment.setPaymentMethod(paymentRequest.getPaymentMethod());
            
            // Store payment details (for card payments)
            if (paymentRequest.getPaymentMethod() == Payment.PaymentMethod.CREDIT_CARD || 
                paymentRequest.getPaymentMethod() == Payment.PaymentMethod.DEBIT_CARD) {
                // In a real app, we would securely handle and tokenize this data
                // Here we're just storing last 4 digits for reference
                if (paymentRequest.getCardNumber() != null && paymentRequest.getCardNumber().length() >= 4) {
                    String last4 = paymentRequest.getCardNumber()
                        .substring(paymentRequest.getCardNumber().length() - 4);
                    payment.setCardLastFour(last4);
                }
                
                // Store cardholder name if provided
                if (paymentRequest.getCardHolderName() != null) {
                    payment.setCardHolderName(paymentRequest.getCardHolderName());
                }
            }
            
            // Process the payment
            Payment processedPayment = paymentService.processPayment(payment, paymentRequest.getOrderId());
            
            return new ResponseEntity<>(processedPayment, HttpStatus.CREATED);
        } catch (Exception e) {
            // Log the error
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody PaymentStatusRequest statusRequest) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, statusRequest.getStatus()));
    }
} 