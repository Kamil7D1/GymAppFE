import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { WorkoutTemplateForm } from '../WorkoutTemplateForm/WorkoutTemplateForm';
import type { WorkoutPlan } from '../WorkoutTemplateForm/WorkoutTemplateForm';
import './UserWorkoutPlans.scss';
import { MainLayout } from '../../MainLayout/MainLayout';

export const UserWorkoutPlans: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<WorkoutPlan | undefined>(undefined);
    const queryClient = useQueryClient();

    const { data: plans, isLoading } = useQuery<WorkoutPlan[]>({
        queryKey: ['userWorkoutPlans'],
        queryFn: async () => {
            const response = await axios.get('/api/workout-plans', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const handleCloseForm = () => {
        setShowForm(false);
        setPlanToEdit(undefined);
    };

    const handleDeletePlan = async (planId: number) => {
        if (window.confirm('Are you sure you want to delete this workout plan?')) {
            try {
                await axios.delete(`/api/workout-plans/${planId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Invalidate and refetch
                await queryClient.invalidateQueries({ queryKey: ['userWorkoutPlans'] });
            } catch (error) {
                console.error('Error deleting workout plan:', error);
                alert('Failed to delete workout plan. Please try again.');
            }
        }
    };

    return (
        <MainLayout>
        <div className="user-workout-plans">
            <div className="plans-header">
                <h2>My Workout Plans</h2>
                <button
                    className="create-plan-button"
                    onClick={() => setShowForm(true)}
                >
                    Create New Plan
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading your workout plans...</div>
            ) : (
                <div className="plans-grid">
                    {plans?.map((plan) => (
                        <div key={plan.id} className="plan-card">
                            <h3>{plan.name}</h3>
                            {plan.description && (
                                <p className="plan-description">{plan.description}</p>
                            )}
                            <div className="exercises-list">
                                {plan.exercises.map((exercise) => (
                                    <div key={exercise.id} className="exercise-item">
                                        <div className="exercise-name">
                                            {exercise.baseExercise?.name}
                                        </div>
                                        <div className="exercise-details">
                                            Sets: {exercise.sets} × Reps: {exercise.reps}
                                            {exercise.weight !== undefined &&
                                                exercise.weight > 0 &&
                                                ` × Weight: ${exercise.weight}kg`}
                                        </div>
                                        {exercise.notes && (
                                            <div className="exercise-notes">{exercise.notes}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="plan-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        setPlanToEdit(plan);
                                        setShowForm(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeletePlan(plan.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <WorkoutTemplateForm
                    onClose={handleCloseForm}
                    templateToEdit={planToEdit}
                    formType="plan"
                />
            )}
        </div>
        </MainLayout>
    );
};