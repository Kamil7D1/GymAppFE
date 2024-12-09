import { useState } from 'react';
import "./SessionsList.scss";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddSessionModal } from '../AddSessionModal/AddSessionModal';

const API_BASE_URL = 'http://localhost:3000'; // Adjust to your backend port

interface Session {
    id: number;
    title: string;
    date: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    maxParticipants: number;
}

const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
};

export const SessionsList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const { data: sessions, isLoading, error } = useQuery<Session[]>({
        queryKey: ['trainingSessions'],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE_URL}/api/training-sessions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const deleteSession = useMutation({
        mutationFn: async (id: number) => {
            setDeletingSessionId(id);
            try {
                const response = await axios.delete(`${API_BASE_URL}/api/training-sessions/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(error.response?.data?.error || 'Failed to delete session');
                }
                throw error;
            } finally {
                setDeletingSessionId(null);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
        },
        onError: (error) => {
            alert(error instanceof Error ? error.message : 'Failed to delete session');
        }
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            deleteSession.mutate(id);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading sessions</div>;

    return (
        <div className="sessions-list">
            <div className="sessions-header">
                <h3>Your Sessions</h3>
                <button onClick={() => setIsModalOpen(true)}>Add New Session</button>
            </div>

            <div className="sessions-grid">
                {sessions?.length === 0 ? (
                    <p>No sessions found. Add your first session!</p>
                ) : (
                    sessions?.map(session => (
                        <div key={session.id} className="session-card">
                            <h4>{session.title}</h4>
                            <p>Date: {session.date}</p>
                            <p>{getDayName(session.dayOfWeek)}</p>
                            <p>{session.startTime} - {session.endTime}</p>
                            <p>Max participants: {session.maxParticipants}</p>
                            <button
                                onClick={() => handleDelete(session.id)}
                                className="delete-button"
                                disabled={deletingSessionId === session.id}
                            >
                                {deletingSessionId === session.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <AddSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};