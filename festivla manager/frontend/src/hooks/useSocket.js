import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket 연결 훅 (표준 WebSocket 사용)
 */
export const useSocket = (url, options = {}) => {
  const { userId, onMessage, onOpen, onClose, onError, reconnect = true, reconnectInterval = 3000 } = options;
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const connect = useCallback(() => {
    if (!userId) {
      console.warn('userId가 없어 WebSocket 연결을 건너뜁니다.');
      return;
    }

    try {
      // 표준 WebSocket 사용
      // URL이 ws:// 또는 wss://로 시작하지 않으면 변환 (http -> ws, https -> wss)
      let wsUrl = url;
      if (url.startsWith('http://')) {
        wsUrl = url.replace('http://', 'ws://');
      } else if (url.startsWith('https://')) {
        wsUrl = url.replace('https://', 'wss://');
      }
      
      wsUrl = `${wsUrl}?userId=${userId}`;
      
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket 연결됨:', wsUrl);
        setIsConnected(true);
        setConnectionError(null);
        if (onOpen) {
          onOpen();
        }
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error);
        setConnectionError(error);
        setIsConnected(false);
        if (onError) {
          onError(error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason);
        setIsConnected(false);

        if (onClose) {
          onClose(event);
        }

        // 재연결 로직
        if (reconnect && event.code !== 1000) {
          // 정상 종료(1000)가 아닌 경우에만 재연결
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('WebSocket 재연결 시도...');
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      setConnectionError(error);
      setIsConnected(false);
    }
  }, [url, userId, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval]);

  useEffect(() => {
    connect();

    // 클린업
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connect]);

  // 메시지 전송
  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket이 연결되지 않아 메시지를 전송할 수 없습니다.');
    }
  }, []);

  return { 
    sendMessage, 
    isConnected, 
    connectionError,
    reconnect: connect
  };
};
