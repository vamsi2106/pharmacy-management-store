package com.pharmacy.management.controller;

import com.pharmacy.management.model.Product;
import com.pharmacy.management.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final ProductService productService;

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/products")
    public String getAllProducts(Model model) {
        List<Product> products = productService.getAllProducts();
        model.addAttribute("products", products);
        return "products";
    }

    @GetMapping("/products/category/{category}")
    public String getProductsByCategory(@PathVariable String category, Model model) {
        List<Product> products = productService.getProductsByCategory(category);
        model.addAttribute("products", products);
        return "products";
    }

    @GetMapping("/products/search")
    public String searchProducts(@RequestParam String name, Model model) {
        List<Product> products = productService.searchProductsByName(name);
        model.addAttribute("products", products);
        return "products";
    }

    @GetMapping("/products/{id}")
    public String getProductById(@PathVariable Long id, Model model) {
        Product product = productService.getProductById(id);
        model.addAttribute("product", product);
        return "product-detail";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/checkout")
    public String checkout() {
        return "checkout";
    }

    @GetMapping("/prescriptions")
    public String prescriptions() {
        return "prescriptions";
    }

    @GetMapping("/orders")
    public String orders() {
        return "orders";
    }

    // Admin routes
    @GetMapping("/admin/products")
    public String adminProducts(Model model) {
        List<Product> products = productService.getAllProducts();
        model.addAttribute("products", products);
        return "admin/products";
    }
} 