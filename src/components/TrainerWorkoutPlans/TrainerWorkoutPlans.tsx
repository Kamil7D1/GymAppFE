import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { WorkoutPlanForm } from '../WorkoutPlanForm/WorkoutPlanForm';
import './TrainerWorkoutPlans.scss';

interface Client {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export const TrainerWorkoutPlans: React.FC = () => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data: clients, isLoading } = useQuery({
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
            const response = await axios.get(
                `/api/workout-plans/client/${selectedClient.id}`,
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

    return (
        <div className="trainer-workout-plans">
            <h2>Client Workout Plans</h2>

            <div className="client-selection">
                <select
                    value={selectedClient?.id || ''}
                    onChange={(e) => {
                        const client = clients?.find(c => c.id === parseInt(e.target.value));
                        setSelectedClient(client || null);
                    }}
                >
                    <option value="">Select a client</option>
                    {clients?.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                        </option>
                    ))}
                </select>

                {selectedClient && (
                    <button
                        className="create-plan-button"
                        onClick={() => setShowForm(true)}
                    >
                        Create New Plan
                    </button>
                )}
            </div>

            {selectedClient && workoutPlans && (
                <div className="client-workout-plans">
                    <h3>Workout Plans for {selectedClient.firstName} {selectedClient.lastName}</h3>
                    {workoutPlans.map((plan: any) => (
                        <div key={plan.id} className="workout-plan-card">
                            {/* Similar to WorkoutPlanList component */}
                        </div>
                    ))}
                </div>
            )}

            {showForm && selectedClient && (
                <WorkoutPlanForm
                    onClose={() => setShowForm(false)}
                    clientId={selectedClient.id}
                />
            )}
        </div>
    );
};