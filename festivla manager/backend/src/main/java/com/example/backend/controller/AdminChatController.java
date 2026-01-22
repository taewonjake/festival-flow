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

@Tag(name = "관리자 채팅", description = "관리자용 채팅 API")
@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
public class AdminChatController {

    private final ChatService chatService;

    @Operation(summary = "채팅방 목록 조회", description = "관리자가 채팅방 목록을 조회합니다")
    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoomResponse>> getAllChatRooms(
            @Parameter(description = "채팅방 상태 (선택사항)")
            @RequestParam(required = false) ChatRoomStatus status) {
        List<ChatRoomResponse> response = chatService.getAllChatRooms(status);
        return ApiResponse.success(response);
    }

    @Operation(summary = "메시지 전송 (관리자)", description = "관리자가 채팅방에 메시지를 전송합니다")
    @PostMapping("/rooms/{chatRoomId}/messages")
    public ApiResponse<ChatMessageResponse> sendMessage(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long chatRoomId,
            @Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(chatRoomId, null, request, SenderRole.ADMIN);
        return ApiResponse.success("메시지가 전송되었습니다", response);
    }

    @Operation(summary = "채팅방 닫기 (관리자)", description = "관리자가 채팅방을 닫습니다")
    @PostMapping("/rooms/{chatRoomId}/close")
    public ApiResponse<Object> closeChatRoom(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long chatRoomId) {
        chatService.closeChatRoom(chatRoomId);
        return ApiResponse.success("채팅방이 닫혔습니다", null);
    }

    @Operation(summary = "메시지 목록 조회 (관리자)", description = "관리자가 채팅방의 메시지 목록을 조회합니다")
    @GetMapping("/rooms/{chatRoomId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long chatRoomId) {
        List<ChatMessageResponse> response = chatService.getMessages(chatRoomId);
        return ApiResponse.success(response);
    }
}
