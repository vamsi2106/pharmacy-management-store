package com.pharmacy.management.payload;

import com.pharmacy.management.model.Order;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull
    private Order.OrderStatus status;
} 