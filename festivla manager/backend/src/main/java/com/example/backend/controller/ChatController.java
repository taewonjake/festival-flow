package com.example.backend.controller;

import com.example.backend.domain.enums.ChatRoomStatus;
import com.example.backend.domain.enums.SenderRole;
import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ChatMessageResponse;
import com.example.backend.dto.response.ChatRoomResponse;
import com.example.backend.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "채팅", description = "채팅 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "채팅방 생성", description = "학생이 채팅방을 생성합니다")
    @PostMapping("/rooms")
    public ApiResponse<ChatRoomResponse> createChatRoom(
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId) {
        ChatRoomResponse response = chatService.createChatRoom(userId);
        return ApiResponse.success("채팅방이 생성되었습니다", response);
    }

    @Operation(summary = "내 채팅방 목록 조회", description = "학생이 자신의 채팅방 목록을 조회합니다")
    @GetMapping("/rooms/me")
    public ApiResponse<List<ChatRoomResponse>> getMyChatRooms(
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId) {
        List<ChatRoomResponse> response = chatService.getMyChatRooms(userId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "메시지 목록 조회", description = "채팅방의 메시지 목록을 조회합니다")
    @GetMapping("/rooms/{chatRoomId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long chatRoomId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId) {
        // 읽음 처리
        chatService.markMessagesAsRead(chatRoomId, userId);
        
        List<ChatMessageResponse> response = chatService.getMessages(chatRoomId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "메시지 전송", description = "채팅방에 메시지를 전송합니다")
    @PostMapping("/rooms/{chatRoomId}/messages")
    public ApiResponse<ChatMessageResponse> sendMessage(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long chatRoomId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(chatRoomId, userId, request, SenderRole.STUDENT);
        return ApiResponse.success("메시지가 전송되었습니다", response);
    }

    @Operation(summary = "채팅방 닫기", description = "채팅방을 닫습니다")
    @PostMapping("/rooms/{chatRoomId}/close")
    public ApiResponse<Object> closeChatRoom(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long chatRoomId) {
        chatService.closeChatRoom(chatRoomId);
        return ApiResponse.success("채팅방이 닫혔습니다", null);
    }
}
