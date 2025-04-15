package com.pharmacy.management.security;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.Payment;
import com.pharmacy.management.model.Prescription;
import com.pharmacy.management.model.User;
import com.pharmacy.management.repository.OrderRepository;
import com.pharmacy.management.repository.PaymentRepository;
import com.pharmacy.management.repository.PrescriptionRepository;
import com.pharmacy.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PaymentRepository paymentRepository;

    public boolean isSameUser(Authentication authentication, Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Optional<User> userOptional = userRepository.findByEmail(authentication.getName());
        return userOptional.isPresent() && userOptional.get().getId().equals(userId);
    }

    public boolean isOrderOwner(Authentication authentication, Long orderId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Optional<User> userOptional = userRepository.findByEmail(authentication.getName());
        if (userOptional.isEmpty()) {
            return false;
        }
        
        User user = userOptional.get();
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        return orderOptional.isPresent() && orderOptional.get().getUser().getId().equals(user.getId());
    }

    public boolean isPrescriptionOwner(Authentication authentication, Long prescriptionId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Optional<User> userOptional = userRepository.findByEmail(authentication.getName());
        if (userOptional.isEmpty()) {
            return false;
        }
        
        User user = userOptional.get();
        Optional<Prescription> prescriptionOptional = prescriptionRepository.findById(prescriptionId);
        return prescriptionOptional.isPresent() && prescriptionOptional.get().getUser().getId().equals(user.getId());
    }

    public boolean isPaymentOwner(Authentication authentication, Long paymentId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Optional<User> userOptional = userRepository.findByEmail(authentication.getName());
        if (userOptional.isEmpty()) {
            return false;
        }
        
        User user = userOptional.get();
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isEmpty()) {
            return false;
        }
        
        Payment payment = paymentOptional.get();
        return payment.getOrder().getUser().getId().equals(user.getId());
    }
} 