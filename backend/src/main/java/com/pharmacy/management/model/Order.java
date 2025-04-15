package com.pharmacy.management.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"orders", "password", "hibernateLazyInitializer"})
    private User user;

    @NotNull
    private LocalDateTime orderDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @NotNull
    private BigDecimal totalPrice;

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("order")
    private List<OrderItem> orderItems = new ArrayList<>();

    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PREPARING,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }
} 