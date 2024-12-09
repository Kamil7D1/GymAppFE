// components/BookPersonalTrainingModal/BookPersonalTrainingModal.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './BookPersonalTrainingModal.scss';

interface Trainer {
    id: number;
    firstName: string;
    lastName: string;
    pricePerSession: number;
}

interface BookPersonalTrainingModalProps {
    isOpen: boolean;
    onClose: () => void;
    trainer: Trainer;
}

export const BookPersonalTrainingModal: React.FC<BookPersonalTrainingModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        trainer
                                                                                    }) => {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const bookTraining = useMutation({
        mutationFn: async () => {
            const response = await axios.post(
                '/api/personal-trainings/book',
                {
                    trainerId: trainer.id,
                    date: selectedDate,
                    time: selectedTime,
                    message
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personalTrainings'] });
            onClose();
            alert('Training session booked successfully!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to book training');
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bookTraining.mutate();
    };

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Book Personal Training</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="trainer-info">
                    <h3>Trainer: {trainer.firstName} {trainer.lastName}</h3>
                    <p>Price per session: ${trainer.pricePerSession}</p>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time">Select Time:</label>
                        <input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            min="06:00"
                            max="22:00"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message to trainer (optional):</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell your trainer about your goals, experience level, or any concerns..."
                            rows={4}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={bookTraining.isPending}
                    >
                        {bookTraining.isPending ? 'Booking...' : 'Book Training'}
                    </button>
                </form>
            </div>
        </div>
    );
};