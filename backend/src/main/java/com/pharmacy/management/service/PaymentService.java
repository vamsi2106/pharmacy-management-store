package com.pharmacy.management.service;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.Payment;
import com.pharmacy.management.repository.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found with id: " + id));
    }

    public Payment getPaymentByOrder(Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return paymentRepository.findByOrder(order)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found for order id: " + orderId));
    }

    @Transactional
    public Payment processPayment(Payment payment, Long orderId) {
        Order order = orderService.getOrderById(orderId);
        
        // Check if payment already exists for this order
        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new IllegalStateException("Payment already exists for order id: " + orderId);
        }
        
        payment.setOrder(order);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        // Generate a unique transaction ID
        payment.setTransactionId(UUID.randomUUID().toString());
        
        // In a real implementation, this would call a payment gateway service
        // to process the payment and update the status accordingly
        
        // For demonstration purposes, we'll simulate a successful payment
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        
        // Update the order status after successful payment
        orderService.updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED);
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(Long paymentId, Payment.PaymentStatus status) {
        Payment payment = getPaymentById(paymentId);
        payment.setStatus(status);
        
        // Update the order status based on payment status
        if (status == Payment.PaymentStatus.COMPLETED) {
            orderService.updateOrderStatus(payment.getOrder().getId(), Order.OrderStatus.CONFIRMED);
        } else if (status == Payment.PaymentStatus.FAILED) {
            orderService.updateOrderStatus(payment.getOrder().getId(), Order.OrderStatus.CANCELLED);
        }
        
        return paymentRepository.save(payment);
    }
} 