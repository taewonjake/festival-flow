package com.example.backend.repository;

import com.example.backend.domain.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방의 메시지 목록 조회 (최신순)
    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);

    // 읽지 않은 메시지 수 조회
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom.id = :chatRoomId AND m.isRead = false")
    Long countUnreadMessages(@Param("chatRoomId") Long chatRoomId);

    // 채팅방의 읽지 않은 메시지 목록 조회
    List<ChatMessage> findByChatRoomIdAndIsReadFalse(Long chatRoomId);
}
