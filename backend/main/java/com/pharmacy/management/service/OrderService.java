package com.pharmacy.management.service;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.OrderItem;
import com.pharmacy.management.model.Product;
import com.pharmacy.management.model.User;
import com.pharmacy.management.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final UserService userService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByUser(Long userId) {
        User user = userService.getUserById(userId);
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Transactional
    public Order createOrder(com.pharmacy.management.payload.OrderRequest orderRequest, User user) {
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(orderRequest.getShippingAddress());
        
        List<OrderItem> orderItems = orderRequest.getItems().stream()
            .map(itemRequest -> {
                OrderItem item = new OrderItem();
                Product product = new Product();
                product.setId(itemRequest.getProductId());
                item.setProduct(product);
                item.setQuantity(itemRequest.getQuantity());
                return item;
            })
            .toList();
        
        return createOrder(order, orderItems);
    }

    @Transactional
    public Order createOrder(Order order, List<OrderItem> orderItems) {
        User user = userService.getUserById(order.getUser().getId());
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        
        // Calculate total price and update stock
        for (OrderItem item : orderItems) {
            Product product = productService.getProductById(item.getProduct().getId());
            
            // Check if product requires prescription
            if (product.getRequiresPrescription()) {
                // Logic to ensure prescription exists and is approved
                // could be implemented here or in a separate validation step
            }
            
            // Update stock
            productService.updateStock(product.getId(), item.getQuantity());
            
            // Set product and price
            item.setProduct(product);
            item.setPrice(product.getPrice());
            
            // Update total price
            totalPrice = totalPrice.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        
        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);
        
        // Set order reference for each order item
        orderItems.forEach(item -> item.setOrder(savedOrder));
        savedOrder.setOrderItems(orderItems);
        
        return orderRepository.save(savedOrder);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
} 