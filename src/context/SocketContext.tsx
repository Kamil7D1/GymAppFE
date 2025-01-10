import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Manager } from 'socket.io-client';

type SocketType = ReturnType<(typeof Manager)['prototype']['socket']>;

interface SocketContextType {
    socket: SocketType | null;
    isConnected: boolean;
    reconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    reconnect: () => {}
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<SocketType | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const initializeSocket = useCallback(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            console.log('Missing credentials for socket connection:', {
                hasToken: !!token,
                userId: userId
            });
            return null;
        }

        console.log('Attempting socket connection with:', {
            token: token.substring(0, 10) + '...',
            userId: userId
        });

        const manager = new Manager(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            auth: {
                token,
                userId
            },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: Math.min(1000 * Math.pow(2, retryCount), 10000),
            timeout: 20000,
            transports: ['websocket', 'polling']
        });

        const socket = manager.socket('/');

        socket.on('connect', () => {
            console.log('Socket connected successfully:', {
                id: socket.id,
                isConnected: socket.connected
            });
        });

        socket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', {
                message: error.message,
                // Zamiast socket.auth używamy wartości z konfiguracji
                auth: {
                    hasToken: !!localStorage.getItem('token'),
                    hasUserId: !!localStorage.getItem('userId')
                }
            });
        });

        return socket;
    }, [retryCount]);

    const reconnect = useCallback(() => {
        if (socket) {
            socket.close();
        }
        setRetryCount(count => count + 1);
        const newSocket = initializeSocket();
        if (newSocket) {
            setSocket(newSocket);
        }
    }, [socket, initializeSocket]);

    useEffect(() => {
        const newSocket = initializeSocket();
        if (!newSocket) return;

        const handleConnect = () => {
            console.log('Socket connected with config:', {
                url: import.meta.env.VITE_API_URL || 'http://localhost:3000',
                auth: {
                    token: !!localStorage.getItem('token'),
                    userId: localStorage.getItem('userId')
                }
            });
            setIsConnected(true);
            setRetryCount(0);

            const userId = localStorage.getItem('userId');
            if (userId) {
                console.log(`Attempting to join room user_${userId}`);
                newSocket.emit('join', userId);
            }
        };

        const handleRoomJoined = (userId: string) => {
            console.log(`Successfully joined room for user_${userId}`);
        };

        const handleDisconnect = (reason: string) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        };

        const handleError = (error: Error) => {
            console.error('Socket error:', error);
            if (!isConnected) {
                reconnect();
            }
        };

        newSocket.on('connect', handleConnect);
        newSocket.on('roomJoined', handleRoomJoined);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('error', handleError);

        // Health check
        const pingInterval = setInterval(() => {
            if (newSocket.connected) {
                console.log('Sending ping...');
                newSocket.emit('ping');
            }
        }, 30000);

        newSocket.on('pong', () => {
            console.log('Received pong from server');
        });

        setSocket(newSocket);

        return () => {
            clearInterval(pingInterval);
            newSocket.off('connect', handleConnect);
            newSocket.off('roomJoined', handleRoomJoined);
            newSocket.off('disconnect', handleDisconnect);
            newSocket.off('error', handleError);
            newSocket.off('pong');
            newSocket.close();
        };
    }, [initializeSocket, reconnect]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
            {children}
        </SocketContext.Provider>
    );
};