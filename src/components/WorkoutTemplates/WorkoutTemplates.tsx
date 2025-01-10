import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { WorkoutTemplateForm } from '../WorkoutTemplateForm/WorkoutTemplateForm';
import type { WorkoutTemplate } from '../WorkoutTemplateForm/WorkoutTemplateForm';
import './WorkoutTemplates.scss';

export const WorkoutTemplates: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<WorkoutTemplate | undefined>(undefined);

    const { data: templates, isLoading } = useQuery<WorkoutTemplate[]>({
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

    const handleCloseForm = () => {
        setShowForm(false);
        setTemplateToEdit(undefined);
    };

    return (
        <div className="workout-templates">
            <div className="templates-header">
                <h2>Workout Templates</h2>
                <button
                    className="create-template-button"
                    onClick={() => setShowForm(true)}
                >
                    Create New Template
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading templates...</div>
            ) : (
                <div className="templates-grid">
                    {templates?.map((template) => (
                        <div key={template.id} className="template-card">
                            <h3>{template.name}</h3>
                            {template.description && (
                                <p className="template-description">{template.description}</p>
                            )}
                            <div className="exercises-list">
                                {template.exercises.map((exercise) => (
                                    <div key={exercise.id} className="exercise-item">
                                        <div className="exercise-name">{exercise.name}</div>
                                        <div className="exercise-details">
                                            Sets: {exercise.sets} × Reps: {exercise.reps}
                                        </div>
                                        {exercise.notes && (
                                            <div className="exercise-notes">{exercise.notes}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="template-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        setTemplateToEdit(template);
                                        setShowForm(true);
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <WorkoutTemplateForm
                    onClose={handleCloseForm}
                    templateToEdit={templateToEdit}
                    formType="template"
                />
            )}
        </div>
    );
};