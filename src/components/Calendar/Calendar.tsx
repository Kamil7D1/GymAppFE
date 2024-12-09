// Calendar.tsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './Calendar.scss';
import { EventClickArg } from '@fullcalendar/core';
import { useState } from "react";
import { ParticipantsModal } from "../ParticipantsModal/ParticipantsModal.tsx";
import { jwtDecode } from "jwt-decode";

interface TrainingSession {
    id: number;
    title: string;
    start: string;
    end: string;
    trainerId: number;
    maxParticipants: number;
    currentParticipants: number;
    isUserRegistered: boolean;
}

interface DecodedToken {
    id: number;
    role: string;
}

const TRAINER_COLORS: Record<number, string> = {
    1: '#ff3f3f',
    2: '#2196F3',
    3: '#9C27B0'
};

interface ApiError {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
        status?: number;
    };
}

export const Calendar = () => {
    const queryClient = useQueryClient();
    const [showParticipants, setShowParticipants] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    // Pobieramy dane użytkownika z tokenu
    const getUserData = (): DecodedToken | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return jwtDecode(token) as DecodedToken;
        } catch {
            return null;
        }
    };

    const userData = getUserData();

    const { data, isLoading, error } = useQuery<TrainingSession[]>({
        queryKey: ['trainingSessions'],
        queryFn: async () => {
            const response = await axios.get<TrainingSession[]>('/api/training-sessions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const checkRegistrationStatus = async (sessionId: number) => {
        const response = await axios.get(`/api/training-sessions/${sessionId}/registration-status`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.isRegistered;
    };

    const handleEventClick = async (clickInfo: EventClickArg) => {
        const sessionId = parseInt(clickInfo.event.id, 10);
        const session = data?.find(s => s.id === sessionId);

        if (!session) return;

        // Sprawdzamy czy użytkownik jest trenerem tej sesji
        const isTrainer = userData?.role === 'TRAINER' && session.trainerId === userData.id;

        if (isTrainer) {
            setSelectedSessionId(sessionId);
            setShowParticipants(true);
            return;
        }

        // Logika dla zwykłych użytkowników
        try {
            const isRegistered = await checkRegistrationStatus(sessionId);

            if (session.currentParticipants >= session.maxParticipants && !isRegistered) {
                alert('This session is full. Please try another time slot.');
                return;
            }

            if (isRegistered) {
                if (window.confirm(`Do you want to unregister from ${session.title}?`)) {
                    await axios.post(
                        `/api/training-sessions/${sessionId}/unregister`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    alert(`Successfully unregistered from ${session.title}`);
                }
            } else {
                if (window.confirm(`Do you want to register for ${session.title}?`)) {
                    await axios.post(
                        `/api/training-sessions/${sessionId}/register`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    alert(`Successfully registered for ${session.title}`);
                }
            }

            queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
        } catch (error) {
            const apiError = error as ApiError;
            alert(apiError.response?.data?.error || 'Operation failed');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="error-message">Error loading sessions</div>;
    if (!data) return null;

    return (
        <div className="calendar-container">
            <h2>Training Sessions</h2>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={data.map(session => ({
                    id: session.id.toString(),
                    title: `${session.title} (${session.currentParticipants}/${session.maxParticipants})`,
                    start: session.start,
                    end: session.end,
                    backgroundColor: session.isUserRegistered ? '#4CAF50' : TRAINER_COLORS[session.trainerId] || '#666',
                    textColor: session.isUserRegistered ? 'white' : 'inherit',
                    borderColor: session.isUserRegistered ? '#45a049' : 'transparent',
                    classNames: [
                        session.currentParticipants >= session.maxParticipants ? 'session-full' : 'session-available',
                        session.isUserRegistered ? 'session-registered' : ''
                    ]
                }))}
                eventClick={handleEventClick}
                height="auto"
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
            />
            {showParticipants && selectedSessionId && (
                <ParticipantsModal
                    isOpen={showParticipants}
                    onClose={() => setShowParticipants(false)}
                    sessionId={selectedSessionId}
                />
            )}
        </div>
    );
};