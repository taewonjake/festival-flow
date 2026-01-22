package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WaitingRequest {

    @NotNull(message = "인원 수는 필수입니다")
    @Min(value = 1, message = "인원 수는 1명 이상이어야 합니다")
    private Integer headCount;
}
