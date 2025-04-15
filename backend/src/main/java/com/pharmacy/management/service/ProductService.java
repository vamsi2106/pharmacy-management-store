package com.pharmacy.management.service;

import com.pharmacy.management.model.Product;
import com.pharmacy.management.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getProductsByPrescriptionRequirement(Boolean requiresPrescription) {
        return productRepository.findByRequiresPrescription(requiresPrescription);
    }

    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setCategory(productDetails.getCategory());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        product.setImageUrl(productDetails.getImageUrl());
        product.setRequiresPrescription(productDetails.getRequiresPrescription());
        
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public Product updateStock(Long id, Integer quantity) {
        Product product = getProductById(id);
        
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }
        
        product.setStock(product.getStock() - quantity);
        return productRepository.save(product);
    }
} 