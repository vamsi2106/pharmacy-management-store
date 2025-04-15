package com.pharmacy.management;

import com.pharmacy.management.model.Product;
import com.pharmacy.management.model.User;
import com.pharmacy.management.repository.ProductRepository;
import com.pharmacy.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(ProductRepository productRepository, 
                                     UserRepository userRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Add test products if they don't exist
            if (productRepository.count() == 0) {
                Product product1 = new Product();
                product1.setName("Paracetamol");
                product1.setDescription("Pain relief medication");
                product1.setCategory("Pain Relief");
                product1.setPrice(new BigDecimal("5.99"));
                product1.setStock(100);
                product1.setRequiresPrescription(false);
                productRepository.save(product1);
                
                Product product2 = new Product();
                product2.setName("Amoxicillin");
                product2.setDescription("Antibiotic for bacterial infections");
                product2.setCategory("Antibiotics");
                product2.setPrice(new BigDecimal("12.50"));
                product2.setStock(50);
                product2.setRequiresPrescription(true);
                productRepository.save(product2);
                
                Product product3 = new Product();
                product3.setName("Vitamin C");
                product3.setDescription("Immune system support");
                product3.setCategory("Vitamins");
                product3.setPrice(new BigDecimal("8.75"));
                product3.setStock(200);
                product3.setRequiresPrescription(false);
                productRepository.save(product3);
                
                Product product4 = new Product();
                product4.setName("Ibuprofen");
                product4.setDescription("Anti-inflammatory medication for pain and fever");
                product4.setCategory("Pain Relief");
                product4.setPrice(new BigDecimal("7.25"));
                product4.setStock(150);
                product4.setRequiresPrescription(false);
                productRepository.save(product4);
            }
            
            // Create users only if they don't exist by email
            if (!userRepository.existsByEmail("admin@pharmacy.com")) {
                User adminUser = new User();
                adminUser.setName("Admin User");
                adminUser.setEmail("admin@pharmacy.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setContactNumber("555-123-4567");
                adminUser.setAddress("123 Admin St, Pharmacy City, PC 12345");
                adminUser.setRole(User.Role.ADMIN);
                userRepository.save(adminUser);
                
                System.out.println("Admin user created successfully!");
            }
            
            if (!userRepository.existsByEmail("pharmacist@pharmacy.com")) {
                User pharmacistUser = new User();
                pharmacistUser.setName("Test Pharmacist");
                pharmacistUser.setEmail("pharmacist@pharmacy.com");
                pharmacistUser.setPassword(passwordEncoder.encode("pharma123"));
                pharmacistUser.setContactNumber("555-987-6543");
                pharmacistUser.setAddress("456 Pharmacy Ave, Medication City, MC 54321");
                pharmacistUser.setRole(User.Role.PHARMACIST);
                userRepository.save(pharmacistUser);
                
                System.out.println("Pharmacist user created successfully!");
            }
            
            if (!userRepository.existsByEmail("user@example.com")) {
                User customerUser1 = new User();
                customerUser1.setName("Test Customer");
                customerUser1.setEmail("user@example.com");
                customerUser1.setPassword(passwordEncoder.encode("user123"));
                customerUser1.setContactNumber("555-789-0123");
                customerUser1.setAddress("789 Customer Rd, Buyer City, BC 67890");
                customerUser1.setRole(User.Role.CUSTOMER);
                userRepository.save(customerUser1);
                
                System.out.println("Customer user created successfully!");
            }
            
            System.out.println("Sample data initialization completed!");
        };
    }
} 