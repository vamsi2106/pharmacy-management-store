package com.pharmacy.management.controller;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.Prescription;
import com.pharmacy.management.service.OrderService;
import com.pharmacy.management.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PrescriptionService prescriptionService;
    private final OrderService orderService;

    @GetMapping("/prescriptions/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Prescription>> getPendingPrescriptions() {
        List<Prescription> pendingPrescriptions = prescriptionService.getPrescriptionsByVerificationStatus(false);
        return ResponseEntity.ok(pendingPrescriptions);
    }

    @GetMapping("/prescriptions/verified")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Prescription>> getVerifiedPrescriptions() {
        List<Prescription> verifiedPrescriptions = prescriptionService.getPrescriptionsByVerificationStatus(true);
        return ResponseEntity.ok(verifiedPrescriptions);
    }

    @GetMapping("/orders/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getPendingOrders() {
        List<Order> pendingOrders = orderService.getOrdersByStatus(Order.OrderStatus.PENDING);
        return ResponseEntity.ok(pendingOrders);
    }

    @GetMapping("/orders/confirmed")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getConfirmedOrders() {
        List<Order> confirmedOrders = orderService.getOrdersByStatus(Order.OrderStatus.CONFIRMED);
        return ResponseEntity.ok(confirmedOrders);
    }

    @GetMapping("/orders/preparing")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getPreparingOrders() {
        List<Order> preparingOrders = orderService.getOrdersByStatus(Order.OrderStatus.PREPARING);
        return ResponseEntity.ok(preparingOrders);
    }

    @GetMapping("/orders/shipped")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getShippedOrders() {
        List<Order> shippedOrders = orderService.getOrdersByStatus(Order.OrderStatus.SHIPPED);
        return ResponseEntity.ok(shippedOrders);
    }
} 