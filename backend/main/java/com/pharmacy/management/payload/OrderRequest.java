package com.pharmacy.management.payload;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotNull
    private String shippingAddress;
    
    @NotEmpty
    private List<OrderItemRequest> items;
    
    private Long prescriptionId;
} 