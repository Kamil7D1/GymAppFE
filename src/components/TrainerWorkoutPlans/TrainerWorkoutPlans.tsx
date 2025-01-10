import React, { useState } from 'react';
import { useMutation, useQuery, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { WorkoutTemplateForm } from '../WorkoutTemplateForm/WorkoutTemplateForm';
import type { WorkoutPlan, PlanExercise } from '../WorkoutTemplateForm/WorkoutTemplateForm';
import './TrainerWorkoutPlans.scss';

interface Client {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

// interface Exercise {
//     id: number;
//     name: string;
//     sets: number;
//     reps: number;
//     notes?: string;
//     weight?: number;
//     orderIndex: number;
//     baseExerciseId: number;
//     baseExercise?: {
//         id: number;
//         name: string;
//         category: string;
//         description?: string;
//     };
// }

export const TrainerWorkoutPlans: React.FC = () => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<WorkoutPlan | undefined>(undefined);

    const queryClient = new QueryClient();

    const { data: clients, isLoading: isLoadingClients } = useQuery({
        queryKey: ['personalTrainingClients'],
        queryFn: async () => {
            const response = await axios.get<Client[]>('/api/trainer/clients', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const { data: workoutPlans, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['clientWorkoutPlans', selectedClient?.id],
        queryFn: async () => {
            if (!selectedClient) return null;
            const response = await axios.get<WorkoutPlan[]>(
                `/api/trainer-workouts/clients/${selectedClient.id}/plans`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        },
        enabled: !!selectedClient
    });

    const deleteMutation = useMutation({
        mutationFn: async (planId: number) => {
            return axios.delete(`/api/trainer-workouts/plans/${planId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['clientWorkoutPlans', selectedClient?.id]
            });
        }
    });

    const handleCloseForm = () => {
        setShowForm(false);
        setPlanToEdit(undefined);
    };

    const handleEditPlan = (plan: WorkoutPlan) => {
        setPlanToEdit(plan);
        setShowForm(true);
    };

    return (
        <div className="trainer-workout-plans">
            <h2>Client Workout Plans</h2>

            <div className="client-selection">
                {isLoadingClients ? (
                    <p>Loading clients...</p>
                ) : (
                    <select
                        value={selectedClient?.id || ''}
                        onChange={(e) => {
                            const client = clients?.find(c => c.id === parseInt(e.target.value));
                            setSelectedClient(client || null);
                            setPlanToEdit(undefined);
                        }}
                    >
                        <option value="">Select a client</option>
                        {clients?.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.firstName} {client.lastName}
                            </option>
                        ))}
                    </select>
                )}

                {selectedClient && (
                    <button
                        className="create-plan-button"
                        onClick={() => {
                            setPlanToEdit(undefined);
                            setShowForm(true);
                        }}
                    >
                        Create New Plan
                    </button>
                )}
            </div>

            {selectedClient && (
                <div className="client-workout-plans">
                    <h3>Workout Plans for {selectedClient.firstName} {selectedClient.lastName}</h3>
                    {isLoadingPlans ? (
                        <p>Loading workout plans...</p>
                    ) : workoutPlans?.length === 0 ? (
                        <p>No workout plans found for this client.</p>
                    ) : (
                        <div className="plans-grid">
                            {workoutPlans?.map((plan) => (
                                <div key={plan.id} className="workout-plan-card">
                                    <div className="workout-plan-header">
                                        <h4>{plan.name}</h4>
                                        <div className="plan-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditPlan(plan)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this plan?')) {
                                                        deleteMutation.mutate(plan.id);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {plan.description && <p className="plan-description">{plan.description}</p>}

                                    <div className="exercises-list">
                                        {plan.exercises.map((exercise: PlanExercise) => (
                                            <div key={exercise.id} className="exercise-item">
                                                <div className="exercise-name">
                                                    {exercise.baseExercise?.name}
                                                </div>
                                                <div className="exercise-details">
                                                    <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                                    {exercise.weight !== undefined && exercise.weight > 0 && (
                                                        <span> × {exercise.weight}kg</span>
                                                    )}
                                                </div>
                                                {exercise.notes && (
                                                    <p className="exercise-notes">{exercise.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <WorkoutTemplateForm
                    onClose={handleCloseForm}
                    templateToEdit={planToEdit}
                    formType="plan"
                    clientId={selectedClient?.id}
                />
            )}
        </div>
    );
};