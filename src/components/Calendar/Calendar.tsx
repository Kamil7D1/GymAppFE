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

interface PersonalBooking {
    id: number;
    date: string;
    time: string;
    trainerId: number;
    clientId: number;
    status: string;
    trainer: {
        firstName: string;
        lastName: string;
    };
}

interface TrainingSession {
    id: string | number;
    title: string;
    start: string;
    end: string;
    trainerId: number;
    maxParticipants: number;
    currentParticipants: number;
    isUserRegistered: boolean;
    type: 'GROUP' | 'PERSONAL';
    clientId?: number;
    status?: string;
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

    const {
        data: groupSessions = [],
        isLoading: isLoadingGroup,
        error: errorGroup
    } = useQuery<TrainingSession[]>({
        queryKey: ['trainingSessions'],
        queryFn: async () => {
            try {
                const response = await axios.get('/api/training-sessions', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching group sessions:', error);
                throw error;
            }
        }
    });

    const {
        data: personalSessions = [],
        isLoading: isLoadingPersonal,
        error: errorPersonal
    } = useQuery<TrainingSession[]>({
        queryKey: ['personalTrainings'],
        queryFn: async () => {
            try {
                const response = await axios.get<PersonalBooking[]>('/api/personal-training/my-bookings', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const validBookings = response.data
                    .map((booking: PersonalBooking) => {
                        try {
                            const baseDate = new Date(booking.date);
                            const [hours, minutes] = booking.time.split(':').map(Number);
                            baseDate.setUTCHours(hours, minutes, 0, 0);
                            const endDate = new Date(baseDate.getTime() + 60 * 60 * 1000);

                            if (isNaN(baseDate.getTime())) {
                                console.error('Invalid date for booking:', booking);
                                return undefined;
                            }

                            const session: TrainingSession = {
                                id: booking.id,
                                title: `Personal Training with ${booking.trainer.firstName}`,
                                start: baseDate.toISOString(),
                                end: endDate.toISOString(),
                                trainerId: booking.trainerId,
                                type: 'PERSONAL',
                                maxParticipants: 1,
                                currentParticipants: 1,
                                isUserRegistered: true,
                                clientId: booking.clientId,
                                status: booking.status
                            };

                            return session;
                        } catch (error) {
                            console.error('Error processing booking:', booking, error);
                            return undefined;
                        }
                    })
                    .filter((booking): booking is TrainingSession => booking !== undefined);

                return validBookings;
            } catch (error) {
                console.error('Error fetching personal sessions:', error);
                throw error;
            }
        }
    });

    const allSessions = [...groupSessions, ...personalSessions];

    const checkRegistrationStatus = async (sessionId: number) => {
        const response = await axios.get(`/api/training-sessions/${sessionId}/registration-status`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.isRegistered;
    };

    const handleEventClick = async (clickInfo: EventClickArg) => {
        const session = allSessions.find(s => s.id.toString() === clickInfo.event.id);

        if (!session) return;

        if (session.type === 'PERSONAL') {
            if (userData?.role === 'TRAINER') {
                alert(`Personal training with ${session.clientId}`);
            } else {
                if (session.status === 'CANCELLED') {
                    alert('This session has been cancelled');
                    return;
                }

                if (window.confirm(`Do you want to cancel this personal training session with trainer ${session.trainerId}?`)) {
                    try {
                        await axios.post(
                            `/api/personal-training/${session.id}/cancel`,
                            {},
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        );
                        alert('Personal training session cancelled successfully');
                        queryClient.invalidateQueries({ queryKey: ['personalTrainings'] });
                    } catch (error) {
                        const apiError = error as ApiError;
                        alert(apiError.response?.data?.error || 'Failed to cancel the training session');
                    }
                }
            }
            return;
        }

        const isTrainer = userData?.role === 'TRAINER' && session.trainerId === userData.id;

        if (isTrainer) {
            setSelectedSessionId(Number(session.id));
            setShowParticipants(true);
            return;
        }

        try {
            const isRegistered = await checkRegistrationStatus(Number(session.id));

            if (session.currentParticipants >= session.maxParticipants && !isRegistered) {
                alert('This session is full. Please try another time slot.');
                return;
            }

            if (isRegistered) {
                if (window.confirm(`Do you want to unregister from ${session.title}?`)) {
                    await axios.post(
                        `/api/training-sessions/${session.id}/unregister`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    alert(`Successfully unregistered from ${session.title}`);
                    queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
                }
            } else {
                if (window.confirm(`Do you want to register for ${session.title}?`)) {
                    await axios.post(
                        `/api/training-sessions/${session.id}/register`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    alert(`Successfully registered for ${session.title}`);
                    queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
                }
            }
        } catch (error) {
            const apiError = error as ApiError;
            alert(apiError.response?.data?.error || 'Operation failed');
        }
    };

    const getEventColor = (session: TrainingSession) => {
        if (session.type === 'PERSONAL') {
            if (session.status === 'CANCELLED') {
                return '#888888'; // Szary kolor dla anulowanych sesji
            }
            return '#ff9800'; // Standardowy kolor dla sesji personalnych
        }

        return session.isUserRegistered
            ? '#4CAF50'
            : TRAINER_COLORS[session.trainerId] || '#666';
    };

    if (isLoadingGroup || isLoadingPersonal) return <div>Loading...</div>;
    if (errorGroup || errorPersonal) return <div className="error-message">Error loading sessions</div>;

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
                events={allSessions.map(session => ({
                    id: session.id.toString(),
                    title: `${session.title} ${session.status === 'CANCELLED' ? '(CANCELLED)' :
                        session.type === 'GROUP' ? `(${session.currentParticipants}/${session.maxParticipants})` : ''}`,
                    start: session.start,
                    end: session.end,
                    backgroundColor: getEventColor(session),
                    textColor: 'white',
                    borderColor: session.type === 'PERSONAL'
                        ? session.status === 'CANCELLED' ? '#888888' : '#ff9800'
                        : session.isUserRegistered
                            ? '#45a049'
                            : 'transparent',
                    classNames: [
                        session.type === 'PERSONAL' ? 'session-personal' : 'session-group',
                        session.type === 'GROUP' && session.currentParticipants >= session.maxParticipants ? 'session-full' : 'session-available',
                        session.type === 'GROUP' && session.isUserRegistered ? 'session-registered' : '',
                        session.status === 'CANCELLED' ? 'session-cancelled' : ''
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