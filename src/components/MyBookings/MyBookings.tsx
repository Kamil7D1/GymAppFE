import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { EventClickArg } from '@fullcalendar/core';

const API_BASE_URL = 'http://localhost:3000';

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

interface ApiError {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
        status?: number;
    };
}

export const MyBookings = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery<TrainingSession[]>({
        queryKey: ['trainingSessions'],
        queryFn: async () => {
            const response = await axios.get<TrainingSession[]>(`${API_BASE_URL}/api/training-sessions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Filtrujemy, żeby pokazać tylko zajęcia, na które użytkownik jest zapisany
            return response.data.filter(session => session.isUserRegistered);
        }
    });

    const handleEventClick = async (clickInfo: EventClickArg) => {
        const sessionId = parseInt(clickInfo.event.id, 10);
        const session = data?.find(s => s.id === sessionId);

        if (!session) return;

        try {
            if (window.confirm(`Do you want to unregister from ${session.title}?`)) {
                await axios.post(
                    `${API_BASE_URL}/api/training-sessions/${sessionId}/unregister`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                alert(`Successfully unregistered from ${session.title}`);
                // Odświeżamy dane w obu kalendarzach
                queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
            }
        } catch (error) {
            const apiError = error as ApiError;
            alert(apiError.response?.data?.error || 'Operation failed');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="error-message">Error loading your sessions</div>;
    if (!data) return null;

    return (
        <div className="calendar-container">
            <h2>My Training Sessions</h2>
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
                    backgroundColor: '#4CAF50',
                    textColor: 'white',
                    borderColor: '#45a049'
                }))}
                eventClick={handleEventClick}
                height="auto"
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
            />
        </div>
    );
};