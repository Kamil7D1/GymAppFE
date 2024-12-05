import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './Calendar.scss';

interface TrainingSession {
    id: string;
    title: string;
    start: string;
    end: string;
    trainerId: number;
    maxParticipants: number;
    currentParticipants: number;
}

export const Calendar = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery<TrainingSession[]>({
        queryKey: ['trainingSessions'],
        queryFn: async () => {
            const response = await axios.get<TrainingSession[]>('http://localhost:3000/api/training-sessions');
            return response.data;
        },
        initialData: [] // Add this line
    });

    console.log('Sessions:', data);

    const bookSession = useMutation({
        mutationFn: (sessionId: number) =>
            axios.post(`/api/training-sessions/${sessionId}/book`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data.error || 'Failed to book session');
            }
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading sessions</div>;
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
                    id: session.id,
                    title: session.title,
                    start: session.start,
                    end: session.end,
                    backgroundColor: session.currentParticipants >= session.maxParticipants ? '#ff4444' : '#4CAF50',
                    classNames: session.currentParticipants >= session.maxParticipants ? ['session-full'] : ['session-available']
                }))}
                eventClick={(info) => {
                    const session = data.find(s => s.id.toString() === info.event.id);
                    if (!session) return;

                    if (session.currentParticipants >= session.maxParticipants) {
                        alert('This session is full');
                        return;
                    }
                    if (confirm('Would you like to book this session?')) {
                        bookSession.mutate(Number(info.event.id));
                    }
                }}
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