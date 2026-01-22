package com.example.backend.dto.response;

import com.example.backend.domain.enums.MessageType;
import com.example.backend.domain.enums.SenderRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private Long messageId;
    private Long chatRoomId;
    private SenderRole senderRole;
    private String message;
    private Boolean isRead;
    private MessageType type;
    private LocalDateTime createdAt;
}
