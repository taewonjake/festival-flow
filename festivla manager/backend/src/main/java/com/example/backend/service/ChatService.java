package com.example.backend.service;

import com.example.backend.domain.entity.ChatMessage;
import com.example.backend.domain.entity.ChatRoom;
import com.example.backend.domain.entity.User;
import com.example.backend.domain.enums.ChatRoomStatus;
import com.example.backend.domain.enums.MessageType;
import com.example.backend.domain.enums.SenderRole;
import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.response.ChatMessageResponse;
import com.example.backend.dto.response.ChatRoomResponse;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    /**
     * 채팅방 생성 (학생용)
     */
    @Transactional
    public ChatRoomResponse createChatRoom(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 이미 열린 채팅방이 있으면 기존 채팅방 반환
        ChatRoom existingRoom = chatRoomRepository.findByUserIdAndStatus(userId, ChatRoomStatus.OPEN)
                .orElse(null);

        if (existingRoom != null) {
            return buildChatRoomResponse(existingRoom);
        }

        // 새 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .user(user)
                .status(ChatRoomStatus.OPEN)
                .lastMessage(null)
                .build();

        chatRoom = chatRoomRepository.save(chatRoom);

        // 시스템 메시지 생성
        ChatMessage systemMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .senderRole(SenderRole.ADMIN)
                .message("채팅이 시작되었습니다. 문의사항을 남겨주세요.")
                .isRead(false)
                .type(MessageType.SYSTEM)
                .build();

        chatMessageRepository.save(systemMessage);

        return buildChatRoomResponse(chatRoom);
    }

    /**
     * 내 채팅방 목록 조회 (학생용)
     */
    public List<ChatRoomResponse> getMyChatRooms(Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return chatRooms.stream()
                .map(this::buildChatRoomResponse)
                .collect(Collectors.toList());
    }

    /**
     * 채팅방 목록 조회 (관리자용)
     */
    public List<ChatRoomResponse> getAllChatRooms(ChatRoomStatus status) {
        List<ChatRoom> chatRooms = status != null
                ? chatRoomRepository.findByStatusOrderByUpdatedAtDesc(status)
                : chatRoomRepository.findAll();
        return chatRooms.stream()
                .map(this::buildChatRoomResponse)
                .collect(Collectors.toList());
    }

    /**
     * 메시지 목록 조회
     */
    public List<ChatMessageResponse> getMessages(Long chatRoomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(chatRoomId);
        return messages.stream()
                .map(this::buildChatMessageResponse)
                .collect(Collectors.toList());
    }

    /**
     * 메시지 전송
     */
    @Transactional
    public ChatMessageResponse sendMessage(Long chatRoomId, Long userId, ChatMessageRequest request, SenderRole senderRole) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        // 채팅방이 닫혀있으면 열기
        if (chatRoom.getStatus() == ChatRoomStatus.CLOSED) {
            chatRoom.open();
        }

        // 메시지 생성
        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .senderRole(senderRole)
                .message(request.getMessage())
                .isRead(false)
                .type(MessageType.TALK)
                .build();

        message = chatMessageRepository.save(message);

        // 채팅방의 마지막 메시지 업데이트
        chatRoom.updateLastMessage(request.getMessage());
        chatRoomRepository.save(chatRoom);

        return buildChatMessageResponse(message);
    }

    /**
     * 메시지 읽음 처리
     */
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findByChatRoomIdAndIsReadFalse(chatRoomId);
        
        // 내가 보낸 메시지가 아닌 것만 읽음 처리
        unreadMessages.stream()
                .filter(msg -> msg.getSenderRole() != SenderRole.STUDENT || !msg.getChatRoom().getUser().getId().equals(userId))
                .forEach(ChatMessage::markAsRead);

        chatMessageRepository.saveAll(unreadMessages);
    }

    /**
     * 채팅방 닫기
     */
    @Transactional
    public void closeChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        chatRoom.close();
        chatRoomRepository.save(chatRoom);
    }

    /**
     * 시스템 메시지 전송 (관리자 알림용)
     */
    @Transactional
    public void sendSystemMessage(Long userId, String content) {
        // 채팅방 찾기
        ChatRoom chatRoom = chatRoomRepository.findByUserIdAndStatus(userId, ChatRoomStatus.OPEN)
                .orElse(null);

        // 열린 채팅방이 없으면 생성
        if (chatRoom == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
            
            chatRoom = ChatRoom.builder()
                    .user(user)
                    .status(ChatRoomStatus.OPEN)
                    .lastMessage(null)
                    .build();
            chatRoom = chatRoomRepository.save(chatRoom);
        }

        // 메시지 생성 및 저장
        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .senderRole(SenderRole.ADMIN)
                .message(content)
                .isRead(false)
                .type(MessageType.SYSTEM)
                .build();

        chatMessageRepository.save(message);

        // 채팅방 마지막 메시지 업데이트
        chatRoom.updateLastMessage(content);
        chatRoomRepository.save(chatRoom);
    }

    /**
     * ChatRoomResponse 생성
     */
    private ChatRoomResponse buildChatRoomResponse(ChatRoom chatRoom) {
        Long unreadCount = chatMessageRepository.countUnreadMessages(chatRoom.getId());

        // 마지막 메시지 시간 찾기
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(chatRoom.getId());
        LocalDateTime lastMessageTime = messages.isEmpty() 
                ? chatRoom.getCreatedAt() 
                : messages.get(messages.size() - 1).getCreatedAt();

        return ChatRoomResponse.builder()
                .chatRoomId(chatRoom.getId())
                .userId(chatRoom.getUser().getId())
                .userNickname(chatRoom.getUser().getNickname())
                .status(chatRoom.getStatus())
                .lastMessage(chatRoom.getLastMessage())
                .unreadCount(unreadCount)
                .lastMessageTime(lastMessageTime)
                .createdAt(chatRoom.getCreatedAt())
                .updatedAt(chatRoom.getUpdatedAt())
                .build();
    }

    /**
     * ChatMessageResponse 생성
     */
    private ChatMessageResponse buildChatMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .messageId(message.getId())
                .chatRoomId(message.getChatRoom().getId())
                .senderRole(message.getSenderRole())
                .message(message.getMessage())
                .isRead(message.getIsRead())
                .type(message.getType())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
