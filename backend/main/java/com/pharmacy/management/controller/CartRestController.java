package com.pharmacy.management.controller;

import com.pharmacy.management.model.Product;
import com.pharmacy.management.model.User;
import com.pharmacy.management.payload.CartItemRequest;
import com.pharmacy.management.service.ProductService;
import com.pharmacy.management.service.UserService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartRestController {

    private final ProductService productService;
    private final UserService userService;
    
    // Map to store user carts - in a real app, this would be in a database
    private final Map<Long, List<CartItem>> userCarts = new HashMap<>();
    
    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<CartItem> cart = getUserCart(currentUser.getId());
        
        return ResponseEntity.ok(buildCartResponse(cart));
    }
    
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody @Valid CartItemRequest request,
            Authentication authentication) {
        
        User currentUser = userService.getUserByEmail(authentication.getName());
        Long userId = currentUser.getId();
        
        // Check if product exists and has sufficient stock
        Product product = productService.getProductById(request.getProductId());
        
        if (product.getStock() < request.getQuantity()) {
            return ResponseEntity.badRequest().body(
                new CartResponse(null, "Insufficient stock for " + product.getName())
            );
        }
        
        if (product.getRequiresPrescription()) {
            return ResponseEntity.badRequest().body(
                new CartResponse(null, "This product requires a prescription. Please upload your prescription first.")
            );
        }
        
        // Get user's cart
        List<CartItem> cart = getUserCart(userId);
        
        // Check if product already in cart
        CartItem existingItem = cart.stream()
            .filter(item -> item.getProductId().equals(request.getProductId()))
            .findFirst()
            .orElse(null);
            
        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(existingItem.getQuantity())));
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setProductId(product.getId());
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            cart.add(newItem);
        }
        
        // Update user's cart
        userCarts.put(userId, cart);
        
        return ResponseEntity.ok(buildCartResponse(cart));
    }
    
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long productId,
            @RequestBody @Valid CartItemRequest request,
            Authentication authentication) {
        
        User currentUser = userService.getUserByEmail(authentication.getName());
        Long userId = currentUser.getId();
        
        // Get user's cart
        List<CartItem> cart = getUserCart(userId);
        
        // Find the item
        CartItem item = cart.stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst()
            .orElse(null);
            
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Check stock
        Product product = productService.getProductById(productId);
        if (product.getStock() < request.getQuantity()) {
            return ResponseEntity.badRequest().body(
                new CartResponse(null, "Insufficient stock for " + product.getName())
            );
        }
        
        // Update or remove
        if (request.getQuantity() <= 0) {
            cart.remove(item);
        } else {
            item.setQuantity(request.getQuantity());
            item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        }
        
        // Update user's cart
        userCarts.put(userId, cart);
        
        return ResponseEntity.ok(buildCartResponse(cart));
    }
    
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable Long productId,
            Authentication authentication) {
        
        User currentUser = userService.getUserByEmail(authentication.getName());
        Long userId = currentUser.getId();
        
        // Get user's cart
        List<CartItem> cart = getUserCart(userId);
        
        // Find and remove the item
        cart.removeIf(item -> item.getProductId().equals(productId));
        
        // Update user's cart
        userCarts.put(userId, cart);
        
        return ResponseEntity.ok(buildCartResponse(cart));
    }
    
    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        userCarts.put(currentUser.getId(), new ArrayList<>());
        
        return ResponseEntity.ok(new CartResponse(new ArrayList<>(), null));
    }
    
    // Helper methods
    private List<CartItem> getUserCart(Long userId) {
        return userCarts.computeIfAbsent(userId, k -> new ArrayList<>());
    }
    
    private CartResponse buildCartResponse(List<CartItem> cart) {
        BigDecimal total = cart.stream()
            .map(CartItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        CartResponse response = new CartResponse();
        response.setItems(cart);
        response.setTotal(total);
        return response;
    }
    
    // Inner classes for data transfer
    @Data
    static class CartItem {
        private Long productId;
        private Product product;
        private Integer quantity;
        private BigDecimal subtotal;
    }
    
    @Data
    static class CartResponse {
        private List<CartItem> items;
        private BigDecimal total;
        private String error;
        
        public CartResponse() {}
        
        public CartResponse(List<CartItem> items, String error) {
            this.items = items;
            this.error = error;
            this.total = items != null ? 
                items.stream().map(CartItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;
        }
    }
} 