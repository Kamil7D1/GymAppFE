import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import './WorkoutPlanList.scss';

interface Exercise {
    id: number;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
}

interface WorkoutPlan {
    id: number;
    name: string;
    description?: string;
    exercises: Exercise[];
    trainer?: {
        firstName: string;
        lastName: string;
    };
}

export const WorkoutPlanList: React.FC = () => {
    const { data: workoutPlans, isLoading } = useQuery({
        queryKey: ['workoutPlans'],
        queryFn: async () => {
            const response = await axios.get<WorkoutPlan[]>('/api/workout-plans', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    if (isLoading) return <div>Loading workout plans...</div>;

    return (
        <div className="workout-plans">
            <h2>Your Workout Plans</h2>
            <div className="workout-plans__list">
                {workoutPlans?.map(plan => (
                    <div key={plan.id} className="workout-plan-card">
                        <div className="workout-plan-card__header">
                            <h3>{plan.name}</h3>
                            {plan.trainer && (
                                <span className="trainer-badge">
                                    Created by {plan.trainer.firstName} {plan.trainer.lastName}
                                </span>
                            )}
                        </div>
                        {plan.description && (
                            <p className="workout-plan-card__description">{plan.description}</p>
                        )}
                        <div className="workout-plan-card__exercises">
                            {plan.exercises.map(exercise => (
                                <div key={exercise.id} className="exercise-item">
                                    <div className="exercise-item__name">{exercise.name}</div>
                                    <div className="exercise-item__details">
                                        {exercise.sets} sets × {exercise.reps} reps
                                        {exercise.weight && ` @ ${exercise.weight}kg`}
                                    </div>
                                    {exercise.notes && (
                                        <div className="exercise-item__notes">{exercise.notes}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};