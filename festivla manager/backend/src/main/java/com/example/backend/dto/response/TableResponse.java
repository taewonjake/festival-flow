package com.example.backend.dto.response;

import com.example.backend.domain.enums.TableStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TableResponse {

    private Long tableId;
    private Integer tableNumber;
    private Integer capacity;
    private TableStatus status;
    private Long currentWaitingId;
}
