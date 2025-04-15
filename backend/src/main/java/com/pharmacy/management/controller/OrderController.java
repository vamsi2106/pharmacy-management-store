package com.pharmacy.management.controller;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.User;
import com.pharmacy.management.payload.ErrorResponse;
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
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    /**
     * Create a new order
     * @param orderRequest Order data from the client
     * @param authentication Current authenticated user
     * @return Created order
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest orderRequest, Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return new ResponseEntity<>(orderService.createOrder(orderRequest, user), HttpStatus.CREATED);
    }

    /**
     * Get all orders - for admins and pharmacists
     * @return List of all orders
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * Get a specific order
     * @param id Order ID
     * @param authentication Current authenticated user
     * @return Order details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST') or @securityService.isOrderOwner(authentication, #id)")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id, Authentication authentication) {
        if (id == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /**
     * Get current user's orders
     * @param authentication Current authenticated user
     * @return List of orders for the current user
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(orderService.getOrdersByUser(user));
    }

    /**
     * Update order status
     * @param id Order ID
     * @param statusRequest New status info
     * @return Updated order
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest statusRequest) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, statusRequest.getStatus()));
    }

    /**
     * Cancel an order
     * @param id Order ID
     * @param authentication Current authenticated user
     * @return Cancelled order
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOrderOwner(authentication, #id)")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
    
    /**
     * Exception handler for method argument type mismatch exceptions
     * Specifically handles when orderId is 'undefined' or other non-numeric values
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "Invalid order ID format";
        if (ex.getValue() != null) {
            message = "Invalid order ID format: '" + ex.getValue() + "'";
        }
        
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), message, ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
} 