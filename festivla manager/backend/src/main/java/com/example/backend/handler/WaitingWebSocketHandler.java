package com.example.backend.handler;

import com.example.backend.dto.response.WebSocketMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 웨이팅 관련 WebSocket 핸들러
 * 사용자별 세션 관리 및 실시간 알림 전송
 */
@Slf4j
@Component
public class WaitingWebSocketHandler extends TextWebSocketHandler {

    // userId -> WebSocketSession 매핑
    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.put(userId, session);
            log.info("WebSocket 연결됨: userId={}, sessionId={}", userId, session.getId());
        } else {
            log.warn("userId를 찾을 수 없어 연결을 종료합니다: sessionId={}", session.getId());
            session.close();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            log.info("WebSocket 연결 종료: userId={}, sessionId={}, status={}", userId, session.getId(), status);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 클라이언트로부터 메시지 수신 (필요시 구현)
        log.debug("메시지 수신: sessionId={}, message={}", session.getId(), message.getPayload());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket 전송 오류: sessionId={}", session.getId(), exception);
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
        }
    }

    /**
     * 특정 사용자에게 메시지 전송
     */
    public void sendToUser(Long userId, WebSocketMessage message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(jsonMessage));
                log.debug("메시지 전송 성공: userId={}, type={}", userId, message.getType());
            } catch (IOException e) {
                log.error("메시지 전송 실패: userId={}", userId, e);
                userSessions.remove(userId);
            }
        } else {
            log.debug("사용자 세션이 없거나 닫혀있음: userId={}", userId);
        }
    }

    /**
     * 세션에서 userId 추출
     * 쿼리 파라미터 또는 헤더에서 userId를 가져옴
     */
    private Long getUserIdFromSession(WebSocketSession session) {
        try {
            // URI 쿼리 파라미터에서 userId 추출 (예: ws://localhost:8080/ws/waiting?userId=1)
            String query = session.getUri().getQuery();
            if (query != null) {
                String[] params = query.split("&");
                for (String param : params) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2 && "userId".equals(keyValue[0])) {
                        return Long.parseLong(keyValue[1]);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("userId 추출 실패: sessionId={}", session.getId(), e);
        }
        return null;
    }

    /**
     * 연결된 사용자 수 조회
     */
    public int getConnectedUserCount() {
        return userSessions.size();
    }
}
