package com.example.backend.dto.response;

import com.example.backend.domain.enums.ChatRoomStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatRoomResponse {

    private Long chatRoomId;
    private Long userId;
    private String userNickname;
    private ChatRoomStatus status;
    private String lastMessage;
    private Long unreadCount;
    private LocalDateTime lastMessageTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
