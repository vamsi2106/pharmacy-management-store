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
            // Add test products only if they don't exist
            if (productRepository.count() == 0) {
                Product product1 = new Product();
                product1.setName("Paracetamol");
                product1.setDescription("Pain relief medication");
                product1.setCategory("Pain Relief");
                product1.setPrice(new BigDecimal("5.99"));
                product1.setStock(100);
                product1.setRequiresPrescription(false);
                product1.setImageUrl("https://assets.sayacare.in/api/images/product_image/large_image/23/74/paracetamol-500-mg-10-tablet-23_1.webp");
                productRepository.save(product1);
                
                Product product2 = new Product();
                product2.setName("Amoxicillin");
                product2.setDescription("Antibiotic for bacterial infections");
                product2.setCategory("Antibiotics");
                product2.setPrice(new BigDecimal("12.50"));
                product2.setStock(50);
                product2.setRequiresPrescription(true);
                product2.setImageUrl("https://c8.alamy.com/comp/DDF80F/amoxicillin-antibiotic-capsules-tablets-pills-DDF80F.jpg");
                productRepository.save(product2);
                
                Product product3 = new Product();
                product3.setName("Vitamin C");
                product3.setDescription("Immune system support");
                product3.setCategory("Vitamins");
                product3.setPrice(new BigDecimal("8.75"));
                product3.setStock(200);
                product3.setRequiresPrescription(false);
                product3.setImageUrl("https://media.istockphoto.com/id/158324666/photo/vitamin-c-pills.jpg?s=612x612&w=0&k=20&c=ANJohnSd2bNsj3Wb5NJam-HjeLh-EaGrQG-t5MgX3Vk=");
                productRepository.save(product3);
                
                Product product4 = new Product();
                product4.setName("Ibuprofen");
                product4.setDescription("Anti-inflammatory medication for pain and fever");
                product4.setCategory("Pain Relief");
                product4.setPrice(new BigDecimal("7.25"));
                product4.setStock(150);
                product4.setRequiresPrescription(false);
                product4.setImageUrl("https://5.imimg.com/data5/SELLER/Default/2023/7/325863554/WI/JM/SY/135658020/ibuprofen-tablets-ip-200-mg-.jpg");
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
            }
            
            System.out.println("Sample data initialized!");
        };
    }
} 