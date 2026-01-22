package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QrVerifyResponse {

    private Long waitingId;
    private Long userId;
    private String userNickname;
    private Integer headCount;
    private Boolean isValid;
    private String message;
}
