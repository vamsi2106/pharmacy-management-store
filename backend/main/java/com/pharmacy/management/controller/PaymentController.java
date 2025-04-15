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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Payment> processPayment(
            @Valid @RequestBody PaymentRequest paymentRequest) {
        
        // Convert the DTO to an entity
        Payment payment = new Payment();
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());
        
        return new ResponseEntity<>(
                paymentService.processPayment(payment, paymentRequest.getOrderId()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody PaymentStatusRequest statusRequest) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, statusRequest.getStatus()));
    }
} 