package com.example.backend.service;

import com.example.backend.domain.entity.ChatMessage;
import com.example.backend.domain.entity.ChatRoom;
import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.User;
import com.example.backend.domain.enums.ChatRoomStatus;
import com.example.backend.domain.enums.MessageType;
import com.example.backend.domain.enums.SenderRole;
import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.dto.response.ChatMessageResponse;
import com.example.backend.dto.response.ChatRoomResponse;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.EventRepository;
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
    private final EventRepository eventRepository;

    @Transactional
    public ChatRoomResponse createChatRoom(Long userId) {
        Event event = getDefaultEvent();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ChatRoom existingRoom = chatRoomRepository.findByEventIdAndUserIdAndStatus(
                event.getId(),
                userId,
                ChatRoomStatus.OPEN
        ).orElse(null);

        if (existingRoom != null) {
            return buildChatRoomResponse(existingRoom);
        }

        ChatRoom chatRoom = ChatRoom.builder()
                .event(event)
                .user(user)
                .status(ChatRoomStatus.OPEN)
                .lastMessage(null)
                .build();

        chatRoom = chatRoomRepository.save(chatRoom);

        ChatMessage systemMessage = ChatMessage.builder()
                .event(event)
                .chatRoom(chatRoom)
                .senderRole(SenderRole.ADMIN)
                .message("채팅이 시작되었습니다. 문의사항을 남겨주세요.")
                .isRead(false)
                .type(MessageType.SYSTEM)
                .build();
        chatMessageRepository.save(systemMessage);

        return buildChatRoomResponse(chatRoom);
    }

    public List<ChatRoomResponse> getMyChatRooms(Long userId) {
        Long eventId = getDefaultEvent().getId();
        List<ChatRoom> chatRooms = chatRoomRepository.findByEventIdAndUserIdOrderByUpdatedAtDesc(eventId, userId);
        return chatRooms.stream()
                .map(this::buildChatRoomResponse)
                .collect(Collectors.toList());
    }

    public List<ChatRoomResponse> getAllChatRooms(ChatRoomStatus status) {
        Long eventId = getDefaultEvent().getId();
        List<ChatRoom> chatRooms = status != null
                ? chatRoomRepository.findByEventIdAndStatusOrderByUpdatedAtDesc(eventId, status)
                : chatRoomRepository.findByEventIdOrderByUpdatedAtDesc(eventId);
        return chatRooms.stream()
                .map(this::buildChatRoomResponse)
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getMessages(Long chatRoomId) {
        Long eventId = getDefaultEvent().getId();
        List<ChatMessage> messages = chatMessageRepository.findByEventIdAndChatRoomIdOrderByCreatedAtAsc(eventId, chatRoomId);
        return messages.stream()
                .map(this::buildChatMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long chatRoomId, Long userId, ChatMessageRequest request, SenderRole senderRole) {
        Long eventId = getDefaultEvent().getId();
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        if (!chatRoom.getEvent().getId().equals(eventId)) {
            throw new IllegalStateException("현재 이벤트의 채팅방이 아닙니다.");
        }

        if (senderRole == SenderRole.STUDENT && !chatRoom.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인 채팅방에만 메시지를 보낼 수 있습니다.");
        }

        if (chatRoom.getStatus() == ChatRoomStatus.CLOSED) {
            chatRoom.open();
        }

        ChatMessage message = ChatMessage.builder()
                .event(chatRoom.getEvent())
                .chatRoom(chatRoom)
                .senderRole(senderRole)
                .message(request.getMessage())
                .isRead(false)
                .type(MessageType.TALK)
                .build();
        message = chatMessageRepository.save(message);

        chatRoom.updateLastMessage(request.getMessage());
        chatRoomRepository.save(chatRoom);

        return buildChatMessageResponse(message);
    }

    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        Long eventId = getDefaultEvent().getId();
        List<ChatMessage> unreadMessages = chatMessageRepository.findByEventIdAndChatRoomIdAndIsReadFalse(eventId, chatRoomId);

        unreadMessages.stream()
                .filter(msg -> msg.getSenderRole() != SenderRole.STUDENT || !msg.getChatRoom().getUser().getId().equals(userId))
                .forEach(ChatMessage::markAsRead);

        chatMessageRepository.saveAll(unreadMessages);
    }

    @Transactional
    public void closeChatRoom(Long chatRoomId) {
        Long eventId = getDefaultEvent().getId();
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        if (!chatRoom.getEvent().getId().equals(eventId)) {
            throw new IllegalStateException("현재 이벤트의 채팅방이 아닙니다.");
        }

        chatRoom.close();
        chatRoomRepository.save(chatRoom);
    }

    @Transactional
    public void sendSystemMessage(Long userId, String content) {
        Event event = getDefaultEvent();
        ChatRoom chatRoom = chatRoomRepository.findByEventIdAndUserIdAndStatus(
                event.getId(),
                userId,
                ChatRoomStatus.OPEN
        ).orElse(null);

        if (chatRoom == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

            chatRoom = ChatRoom.builder()
                    .event(event)
                    .user(user)
                    .status(ChatRoomStatus.OPEN)
                    .lastMessage(null)
                    .build();
            chatRoom = chatRoomRepository.save(chatRoom);
        }

        ChatMessage message = ChatMessage.builder()
                .event(event)
                .chatRoom(chatRoom)
                .senderRole(SenderRole.ADMIN)
                .message(content)
                .isRead(false)
                .type(MessageType.SYSTEM)
                .build();
        chatMessageRepository.save(message);

        chatRoom.updateLastMessage(content);
        chatRoomRepository.save(chatRoom);
    }

    private Event getDefaultEvent() {
        return eventRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("기본 이벤트가 존재하지 않습니다."));
    }

    private ChatRoomResponse buildChatRoomResponse(ChatRoom chatRoom) {
        Long unreadCount = chatMessageRepository.countUnreadMessages(chatRoom.getEvent().getId(), chatRoom.getId());
        List<ChatMessage> messages = chatMessageRepository.findByEventIdAndChatRoomIdOrderByCreatedAtAsc(
                chatRoom.getEvent().getId(),
                chatRoom.getId()
        );
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
