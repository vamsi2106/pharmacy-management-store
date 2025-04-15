package com.pharmacy.management.payload;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequest {

    @NotNull
    private Long productId;
    
    @NotNull
    @Min(1)
    private Integer quantity;
} 