package com.example.backend.dto.request;

import com.example.backend.domain.enums.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TableStatusUpdateRequest {

    @NotNull(message = "테이블 상태는 필수입니다")
    private TableStatus status;
}
