import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NotificationsPanel.scss';
import { useSocket } from '../../context/SocketContext.tsx';

interface NotificationData {
    date?: string;
    time?: string;
    planId?: number;
    sessionId?: number;
    clientName?: string;
    daysLeft?: number;
}

interface Notification {
    id: number;
    userId: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    data?: NotificationData;
}

export const NotificationsPanel: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { socket } = useSocket();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId || !socket) return;

        // Monitoruj stan połączenia
        socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Pobierz początkowe powiadomienia
        fetchNotifications();

        // Nasłuchuj nowych powiadomień
        socket.on('newNotification', (notification: Notification) => {
            console.log('New notification received:', notification);
            if (notification.userId === parseInt(userId)) {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                showBrowserNotification(notification);
            }
        });

        return () => {
            if (socket) {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('newNotification');
            }
        };
    }, [socket, userId]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            const data = await response.data;
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(notifications.map(notification => ({
                ...notification,
                isRead: true
            })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const showBrowserNotification = (notification: Notification) => {
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/notification-icon.png'
            });
        }
    };

    // Funkcja testowa do usunięcia w produkcji
    const testNotification = async () => {
        try {
            await axios.post('/api/notifications/test', {
                userId
            });
            console.log('Test notification sent');
        } catch (error) {
            console.error('Error sending test notification:', error);
        }
    };

    return (
        <div className="notifications-panel">
            <button
                className="notifications-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isConnected ? (
                    <>
                        <i className="notifications-icon" />
                        {unreadCount > 0 && (
                            <span className="notifications-badge">{unreadCount}</span>
                        )}
                    </>
                ) : (
                    <i className="notifications-icon notifications-icon--disconnected" />
                )}
            </button>

            {/* Przycisk testowy - usunąć w produkcji */}
            <button onClick={testNotification} className="test-notification-button">
                Test Notification
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h3>Powiadomienia</h3>
                        {notifications.length > 0 && (
                            <button
                                className="mark-all-read"
                                onClick={markAllAsRead}
                            >
                                Oznacz wszystkie jako przeczytane
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <p className="no-notifications">Brak powiadomień</p>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};