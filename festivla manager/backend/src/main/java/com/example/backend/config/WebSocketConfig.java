package com.example.backend.config;

import com.example.backend.handler.WaitingWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final WaitingWebSocketHandler waitingWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(waitingWebSocketHandler, "/ws/waiting")
                .setAllowedOriginPatterns("*"); // 모든 출처 허용, SockJS 제거 (표준 WebSocket 사용)
    }
}
