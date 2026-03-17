package com.example.backend.repository;

import com.example.backend.domain.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByEventIdAndChatRoomIdOrderByCreatedAtAsc(Long eventId, Long chatRoomId);

    @Query("""
            SELECT COUNT(m)
            FROM ChatMessage m
            WHERE m.event.id = :eventId
              AND m.chatRoom.id = :chatRoomId
              AND m.isRead = false
            """)
    Long countUnreadMessages(@Param("eventId") Long eventId, @Param("chatRoomId") Long chatRoomId);

    List<ChatMessage> findByEventIdAndChatRoomIdAndIsReadFalse(Long eventId, Long chatRoomId);
}
