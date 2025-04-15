package com.pharmacy.management.controller;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.User;
import com.pharmacy.management.payload.OrderRequest;
import com.pharmacy.management.payload.StatusUpdateRequest;
import com.pharmacy.management.service.OrderService;
import com.pharmacy.management.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(orderService.getOrdersByUser(currentUser.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST') or @securityService.isOrderOwner(authentication, #id)")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST') or @securityService.isSameUser(authentication, #userId)")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest orderRequest, Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        Order createdOrder = orderService.createOrder(orderRequest, user);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest statusRequest) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, statusRequest.getStatus()));
    }
} 