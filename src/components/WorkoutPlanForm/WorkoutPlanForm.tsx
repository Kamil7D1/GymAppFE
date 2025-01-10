import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './WorkoutPlanForm.scss';

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
}

interface WorkoutPlanFormProps {
    onClose: () => void;
    initialData?: {
        id?: number;
        name: string;
        description?: string;
        exercises: Exercise[];
    };
    clientId?: number; // Opcjonalne - tylko dla trenerów
}

export const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({
                                                                    onClose,
                                                                    initialData,
                                                                    clientId
                                                                }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [exercises, setExercises] = useState<Exercise[]>(initialData?.exercises || []);

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const endpoint = clientId
                ? `/api/trainer-workouts/clients/${clientId}/plans`  // Updated endpoint
                : '/api/workout-plans';

            return axios.post(endpoint, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['clientWorkoutPlans', clientId]
            });
            onClose();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.put(
                `/api/workout-plans/${initialData?.id}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, description, exercises, clientId };
        // console.log('Request data:', {
        //     name, description, exercises, clientId
        // });

        if (initialData?.id) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const addExercise = () => {
        setExercises([
            ...exercises,
            { name: '', sets: 3, reps: 10 }
        ]);
    };

    const updateExercise = (index: number, field: keyof Exercise, value: any) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = {
            ...updatedExercises[index],
            [field]: value
        };
        setExercises(updatedExercises);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    return (
        <div className="workout-plan-form-overlay" onClick={onClose}>
            <div className="workout-plan-form" onClick={e => e.stopPropagation()}>
                <h2>{initialData ? 'Edit Workout Plan' : 'Create New Workout Plan'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Plan Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="e.g., Full Body Workout"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your workout plan"
                            rows={3}
                        />
                    </div>

                    <div className="exercises-section">
                        <h3>Exercises</h3>
                        {exercises.map((exercise, index) => (
                            <div key={index} className="exercise-form">
                                <input
                                    type="text"
                                    value={exercise.name}
                                    onChange={e => updateExercise(index, 'name', e.target.value)}
                                    placeholder="Exercise name"
                                    required
                                />
                                <div className="exercise-details">
                                    <input
                                        type="number"
                                        value={exercise.sets}
                                        onChange={e => updateExercise(index, 'sets', parseInt(e.target.value))}
                                        placeholder="Sets"
                                        min="1"
                                        required
                                    />
                                    <input
                                        type="number"
                                        value={exercise.reps}
                                        onChange={e => updateExercise(index, 'reps', parseInt(e.target.value))}
                                        placeholder="Reps"
                                        min="1"
                                        required
                                    />
                                    <input
                                        type="number"
                                        value={exercise.weight || ''}
                                        onChange={e => updateExercise(index, 'weight', parseFloat(e.target.value))}
                                        placeholder="Weight (kg)"
                                        step="0.5"
                                    />
                                </div>
                                <textarea
                                    value={exercise.notes || ''}
                                    onChange={e => updateExercise(index, 'notes', e.target.value)}
                                    placeholder="Notes (optional)"
                                    rows={2}
                                />
                                <button
                                    type="button"
                                    className="remove-exercise"
                                    onClick={() => removeExercise(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="add-exercise"
                            onClick={addExercise}
                        >
                            Add Exercise
                        </button>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? 'Saving...'
                                : initialData ? 'Update Plan' : 'Create Plan'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};