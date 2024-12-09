import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './AddSessionModal.scss';

interface AddSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    isRecurring: boolean;
}

interface FormErrors {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    maxParticipants?: string;
    general?: string;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    const [form, setForm] = useState<FormData>({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '07:00',
        endTime: '08:00',
        maxParticipants: 10,
        isRecurring: false
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(form.date);

        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.date) newErrors.date = 'Date is required';
        if (selectedDate < today) newErrors.date = 'Cannot create sessions in the past';
        if (selectedDate.getTime() === today.getTime()) newErrors.date = 'Cannot create sessions for today';
        if (!form.startTime) newErrors.startTime = 'Start time is required';
        if (!form.endTime) newErrors.endTime = 'End time is required';
        if (form.startTime >= form.endTime) newErrors.endTime = 'End time must be after start time';
        if (form.maxParticipants < 1) newErrors.maxParticipants = 'At least one participant is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setForm({
            title: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '07:00',
            endTime: '08:00',
            maxParticipants: 10,
            isRecurring: false
        });
        setErrors({});
    };

    const addSession = useMutation({
        mutationFn: (data: FormData) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(data.date);

            if (selectedDate <= today) {
                throw new Error('Cannot create sessions for today or past dates');
            }

            return axios.post('http://localhost:3000/api/trainer/sessions', data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainingSessions'] });
            resetForm();
            onClose();
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                setErrors({
                    general: error.response?.data.error || 'Failed to add session'
                });
            }
        }
    });

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add New Training Session</h2>
                {errors.general && (
                    <div className="error-message">
                        {errors.general}
                    </div>
                )}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (validateForm()) {
                        addSession.mutate(form);
                    }
                }}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className={errors.title ? 'error-input' : ''}
                        />
                        {errors.title && <span className="error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            className={errors.date ? 'error-input' : ''}
                        />
                        {errors.date && <span className="error">{errors.date}</span>}
                    </div>

                    <div className="form-group">
                        <label>Start Time</label>
                        <input
                            type="time"
                            value={form.startTime}
                            onChange={e => setForm({ ...form, startTime: e.target.value })}
                            className={errors.startTime ? 'error-input' : ''}
                        />
                        {errors.startTime && <span className="error">{errors.startTime}</span>}
                    </div>

                    <div className="form-group">
                        <label>End Time</label>
                        <input
                            type="time"
                            value={form.endTime}
                            onChange={e => setForm({ ...form, endTime: e.target.value })}
                            className={errors.endTime ? 'error-input' : ''}
                        />
                        {errors.endTime && <span className="error">{errors.endTime}</span>}
                    </div>

                    <div className="form-group">
                        <label>Max Participants</label>
                        <input
                            type="number"
                            value={form.maxParticipants}
                            min="1"
                            onChange={e => setForm({ ...form, maxParticipants: parseInt(e.target.value) })}
                            className={errors.maxParticipants ? 'error-input' : ''}
                        />
                        {errors.maxParticipants && <span className="error">{errors.maxParticipants}</span>}
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.isRecurring}
                                onChange={e => setForm({ ...form, isRecurring: e.target.checked })}
                            />
                            Repeat weekly
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={handleClose}>Cancel</button>
                        <button
                            type="submit"
                            disabled={addSession.isPending}
                        >
                            {addSession.isPending ? 'Adding...' : 'Add Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};