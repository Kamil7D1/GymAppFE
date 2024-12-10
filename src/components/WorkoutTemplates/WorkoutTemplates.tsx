import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './WorkoutTemplates.scss';

export const WorkoutTemplates: React.FC = () => {
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const queryClient = useQueryClient();

    const { data: templates, isLoading } = useQuery({
        queryKey: ['workoutTemplates'],
        queryFn: async () => {
            const response = await axios.get('/api/workout-templates', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const useTemplateMutation = useMutation({
        mutationFn: async ({ templateId, clientId }: { templateId: number, clientId: number }) => {
            const response = await axios.post(
                '/api/workout-templates/use',
                { templateId, clientId },
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
        }
    });

    return (
        <div className="workout-templates">
            <div className="templates-header">
                <h2>Workout Templates</h2>
                <button
                    className="create-template-button"
                    onClick={() => setShowTemplateForm(true)}
                >
                    Create New Template
                </button>
            </div>

            <div className="templates-grid">
                {templates?.map((template: any) => (
                    <div key={template.id} className="template-card">
                        <h3>{template.name}</h3>
                        {template.description && (
                            <p className="template-description">{template.description}</p>
                        )}
                        <div className="exercises-count">
                            {template.exercises.length} exercises
                        </div>
                        <div className="template-actions">
                            <button
                                className="edit-button"
                                onClick={() => {/* Dodaj edycję */}}
                            >
                                Edit
                            </button>
                            <button
                                className="use-button"
                                onClick={() => {/* Dodaj użycie szablonu */}}
                            >
                                Use for Client
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showTemplateForm && (
                <WorkoutTemplateForm
                    onClose={() => setShowTemplateForm(false)}
                />
            )}
        </div>
    );
};