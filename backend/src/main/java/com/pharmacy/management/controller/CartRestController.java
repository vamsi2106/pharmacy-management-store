package com.pharmacy.management.controller;

import com.pharmacy.management.model.Cart;
import com.pharmacy.management.model.CartItem;
import com.pharmacy.management.model.Product;
import com.pharmacy.management.model.User;
import com.pharmacy.management.payload.CartItemRequest;
import com.pharmacy.management.service.CartService;
import com.pharmacy.management.service.UserService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartRestController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        Cart cart = cartService.getCart(currentUser);
        return ResponseEntity.ok(buildCartResponse(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody @Valid CartItemRequest request,
            Authentication authentication) {
        try {
            User currentUser = userService.getUserByEmail(authentication.getName());
            Cart cart = cartService.addToCart(currentUser, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(buildCartResponse(cart));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new CartResponse(null, e.getMessage()));
        }
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long productId,
            @RequestBody @Valid CartItemRequest request,
            Authentication authentication) {
        try {
            User currentUser = userService.getUserByEmail(authentication.getName());
            Cart cart = cartService.updateCartItem(currentUser, productId, request.getQuantity());
            return ResponseEntity.ok(buildCartResponse(cart));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new CartResponse(null, e.getMessage()));
        }
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable Long productId,
            Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        Cart cart = cartService.removeFromCart(currentUser, productId);
        return ResponseEntity.ok(buildCartResponse(cart));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        Cart cart = cartService.clearCart(currentUser);
        return ResponseEntity.ok(buildCartResponse(cart));
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
            .map(item -> new CartItemResponse(
                item.getId(),
                item.getProduct(),
                item.getQuantity(),
                item.getSubtotal()
            ))
            .collect(Collectors.toList());

        BigDecimal total = cart.getItems().stream()
            .map(CartItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, total, null);
    }

    @Data
    static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal total;
        private String error;

        public CartResponse() {}

        public CartResponse(List<CartItemResponse> items, String error) {
            this.items = items;
            this.error = error;
            this.total = items != null ?
                items.stream()
                    .map(CartItemResponse::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add) 
                : BigDecimal.ZERO;
        }

        public CartResponse(List<CartItemResponse> items, BigDecimal total, String error) {
            this.items = items;
            this.total = total;
            this.error = error;
        }
    }

    @Data
    static class CartItemResponse {
        private Long id;
        private Product product;
        private Integer quantity;
        private BigDecimal subtotal;

        public CartItemResponse(Long id, Product product, Integer quantity, BigDecimal subtotal) {
            this.id = id;
            this.product = product;
            this.quantity = quantity;
            this.subtotal = subtotal;
        }
    }
} 