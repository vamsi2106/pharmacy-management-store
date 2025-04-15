package com.pharmacy.management.controller;

import com.pharmacy.management.model.Product;
import com.pharmacy.management.service.ProductService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final ProductService productService;

    @GetMapping
    public String viewCart(HttpSession session, Model model) {
        Map<Long, Integer> cart = getCartFromSession(session);
        
        List<Map<String, Object>> cartItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        
        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Long productId = entry.getKey();
            Integer quantity = entry.getValue();
            
            Product product = productService.getProductById(productId);
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            
            Map<String, Object> cartItem = new HashMap<>();
            cartItem.put("product", product);
            cartItem.put("quantity", quantity);
            cartItem.put("total", itemTotal);
            
            cartItems.add(cartItem);
            totalPrice = totalPrice.add(itemTotal);
        }
        
        model.addAttribute("cartItems", cartItems);
        model.addAttribute("totalPrice", totalPrice);
        
        return "cart";
    }
    
    @PostMapping("/add")
    public String addToCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        // Check if product exists and has sufficient stock
        Product product = productService.getProductById(productId);
        
        if (product.getStock() < quantity) {
            redirectAttributes.addFlashAttribute("error", "Insufficient stock for " + product.getName());
            return "redirect:/products/" + productId;
        }
        
        if (product.getRequiresPrescription()) {
            redirectAttributes.addFlashAttribute("error", 
                    "This product requires a prescription. Please upload your prescription first.");
            return "redirect:/prescriptions/upload";
        }
        
        // Add to cart
        Map<Long, Integer> cart = getCartFromSession(session);
        
        // If product already in cart, increase quantity
        cart.put(productId, cart.getOrDefault(productId, 0) + quantity);
        
        // Save cart to session
        session.setAttribute("cart", cart);
        
        redirectAttributes.addFlashAttribute("success", 
                product.getName() + " added to cart successfully");
        
        return "redirect:/cart";
    }
    
    @PostMapping("/update")
    public String updateCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            HttpSession session) {
        
        Map<Long, Integer> cart = getCartFromSession(session);
        
        if (quantity <= 0) {
            cart.remove(productId);
        } else {
            // Validate against product stock
            Product product = productService.getProductById(productId);
            if (product.getStock() >= quantity) {
                cart.put(productId, quantity);
            }
        }
        
        session.setAttribute("cart", cart);
        return "redirect:/cart";
    }
    
    @PostMapping("/remove")
    public String removeFromCart(
            @RequestParam Long productId,
            HttpSession session) {
        
        Map<Long, Integer> cart = getCartFromSession(session);
        cart.remove(productId);
        
        session.setAttribute("cart", cart);
        return "redirect:/cart";
    }
    
    @PostMapping("/clear")
    public String clearCart(HttpSession session) {
        session.removeAttribute("cart");
        return "redirect:/cart";
    }
    
    private Map<Long, Integer> getCartFromSession(HttpSession session) {
        @SuppressWarnings("unchecked")
        Map<Long, Integer> cart = (Map<Long, Integer>) session.getAttribute("cart");
        
        if (cart == null) {
            cart = new HashMap<>();
        }
        
        return cart;
    }
} 