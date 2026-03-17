package com.example.backend.domain.entity;

import com.example.backend.domain.common.BaseTimeEntity;
import com.example.backend.domain.enums.ChatRoomStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_rooms", indexes = {
    @Index(name = "idx_chat_rooms_event_user", columnList = "event_id,user_id"),
    @Index(name = "idx_chat_rooms_event_status", columnList = "event_id,status")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChatRoomStatus status;

    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    @Builder
    public ChatRoom(Event event, User user, ChatRoomStatus status, String lastMessage) {
        this.event = event;
        this.user = user;
        this.status = status;
        this.lastMessage = lastMessage;
    }

    public void updateStatus(ChatRoomStatus status) {
        this.status = status;
    }

    public void updateLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public void open() {
        this.status = ChatRoomStatus.OPEN;
    }

    public void close() {
        this.status = ChatRoomStatus.CLOSED;
    }
}
