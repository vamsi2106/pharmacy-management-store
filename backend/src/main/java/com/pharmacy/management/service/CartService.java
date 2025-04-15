package com.pharmacy.management.service;

import com.pharmacy.management.model.Cart;
import com.pharmacy.management.model.CartItem;
import com.pharmacy.management.model.Product;
import com.pharmacy.management.model.User;
import com.pharmacy.management.repository.CartRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductService productService;

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public Cart addToCart(User user, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productService.getProductById(productId);

        // Check stock
        if (product.getStock() < quantity) {
            throw new IllegalStateException("Insufficient stock for product: " + product.getName());
        }

        // Check prescription requirement
        if (product.getRequiresPrescription()) {
            throw new IllegalStateException("This product requires a prescription. Please upload your prescription first.");
        }

        // Find existing item or create new one
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    cart.getItems().add(newItem);
                    return newItem;
                });

        cartItem.setQuantity(cartItem.getQuantity() != null ? cartItem.getQuantity() + quantity : quantity);
        cartItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateCartItem(User user, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productService.getProductById(productId);

        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        } else {
            // Check stock
            if (product.getStock() < quantity) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }

            CartItem cartItem = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));

            cartItem.setQuantity(quantity);
            cartItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeFromCart(User user, Long productId) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }

    public Cart getCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });
    }
} 