package com.pharmacy.management.service;

import com.pharmacy.management.model.Order;
import com.pharmacy.management.model.OrderItem;
import com.pharmacy.management.model.Product;
import com.pharmacy.management.model.User;
import com.pharmacy.management.payload.OrderRequest;
import com.pharmacy.management.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final UserService userService;
    private final CartService cartService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Transactional
    public Order createOrder(OrderRequest orderRequest, User user) {
        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setShippingAddress(orderRequest.getShippingAddress());
        
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        
        // Create order items from request
        for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
            Product product = productService.getProductById(itemRequest.getProductId());
            
            // Validate product stock
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalStateException(
                    "Not enough stock for product: " + product.getName() + 
                    ". Available: " + product.getStock() + 
                    ", Requested: " + itemRequest.getQuantity()
                );
            }
            
            // Calculate item price
            BigDecimal itemPrice = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalPrice = totalPrice.add(itemPrice);
            
            // Create and add order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItems.add(orderItem);
            
            // Update product stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productService.updateProduct(product.getId(), product);
        }
        
        order.setTotalPrice(totalPrice);
        order.setOrderItems(orderItems);
        
        // Save and return order
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        
        // Check if order can be cancelled
        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel order that has been shipped or delivered");
        }
        
        // Return items to inventory
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productService.updateProduct(product.getId(), product);
        }
        
        // Update order status
        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
} 