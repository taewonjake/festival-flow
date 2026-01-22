package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QrVerifyRequest {

    @NotBlank(message = "QR 코드 데이터는 필수입니다")
    private String qrData;
}
