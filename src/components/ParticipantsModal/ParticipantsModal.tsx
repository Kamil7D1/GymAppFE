// ParticipantsModal.tsx
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import './ParticipantsModal.scss';

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number;
}

interface Participant {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface SessionDetails {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
}

interface ParticipantsResponse {
    sessionDetails: SessionDetails;
    participants: Participant[];
}

interface ApiErrorResponse {
    error: string;
}

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({ isOpen, onClose, sessionId }) => {
    const queryClient = useQueryClient();

    const { data, isLoading, error: queryError } = useQuery<ParticipantsResponse, AxiosError<ApiErrorResponse>>({
        queryKey: ['sessionParticipants', sessionId],
        queryFn: async () => {
            const response = await axios.get(`/api/training-sessions/${sessionId}/participants`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        },
        enabled: isOpen
    });

    const handleRemoveParticipant = async (participantId: number, participantName: string) => {
        if (!window.confirm(`Are you sure you want to remove ${participantName} from this session?`)) {
            return;
        }

        try {
            console.log('Sending request to remove participant:', {
                sessionId,
                participantId
            });

            const response = await axios.delete(`/api/training-sessions/${sessionId}/participants/${participantId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Remove participant response:', response.data);

            queryClient.invalidateQueries({ queryKey: ['sessionParticipants', sessionId] });
            queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                error: error
            });
            const errorMessage = error.response?.data?.error || 'Failed to remove participant';
            alert(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Session Participants</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {data?.sessionDetails && (
                    <div className="session-info">
                        <p>{data.sessionDetails.title}</p>
                        <p>{new Date(data.sessionDetails.date).toLocaleDateString()} {data.sessionDetails.startTime}-{data.sessionDetails.endTime}</p>
                        <p>Participants: {data?.participants.length}/{data.sessionDetails.maxParticipants}</p>
                    </div>
                )}

                {isLoading && <div className="loading">Loading participants...</div>}
                {queryError && (
                    <div className="error">
                        {queryError.response?.data?.error || 'Failed to load participants'}
                    </div>
                )}

                {data && (
                    <div className="participants-list">
                        {data.participants.length === 0 ? (
                            <p className="no-participants">No participants registered yet</p>
                        ) : (
                            <table>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.participants.map((participant) => (
                                    <tr key={participant.id}>
                                        <td>{participant.firstName} {participant.lastName}</td>
                                        <td>{participant.email}</td>
                                        <td>
                                            <button
                                                className="remove-button"
                                                onClick={() => handleRemoveParticipant(
                                                    participant.id,
                                                    `${participant.firstName} ${participant.lastName}`
                                                )}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};