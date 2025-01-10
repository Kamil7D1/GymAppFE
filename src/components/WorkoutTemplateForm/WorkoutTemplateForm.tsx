import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import './WorkoutTemplateForm.scss';

// Base types
export interface BaseExercise {
    id: number;
    name: string;
    category: string;
    description?: string;
}

// Common fields for all exercise types
interface BaseWorkoutExercise {
    id: number;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    orderIndex: number;
}

// Plan-specific exercise type
export interface PlanExercise extends BaseWorkoutExercise {
    baseExerciseId: number;
    baseExercise?: BaseExercise;
}

// Template-specific exercise type
export interface TemplateExercise extends BaseWorkoutExercise {
    name: string;
}

export interface WorkoutPlan {
    id: number;
    name: string;
    description?: string;
    exercises: PlanExercise[];
    createdAt: string;
    updatedAt: string;
}

export interface WorkoutTemplate {
    id: number;
    name: string;
    description?: string;
    exercises: TemplateExercise[];
    createdAt: string;
    updatedAt: string;
}

interface WorkoutTemplateFormProps {
    onClose: () => void;
    templateToEdit?: WorkoutTemplate | WorkoutPlan;
    formType: 'template' | 'plan';
    clientId?: number; // Dodane dla obsługi planów trenera
}

interface ApiError {
    error: string;
}

interface FormExercise {
    id?: number;
    name: string;
    baseExerciseId?: number;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    orderIndex: number;
}

interface MutationData {
    name: string;
    description?: string;
    exercises: FormExercise[];
}

interface FormattedExercise {
    id?: number;
    name?: string;
    baseExerciseId?: number;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    orderIndex: number;
}

export const WorkoutTemplateForm: React.FC<WorkoutTemplateFormProps> = ({
                                                                            onClose,
                                                                            templateToEdit,
                                                                            formType,
                                                                            clientId
                                                                        }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState(templateToEdit?.name || '');
    const [description, setDescription] = useState(templateToEdit?.description || '');
    const [exercises, setExercises] = useState<FormExercise[]>(() => {
        if (!templateToEdit) return [];

        return templateToEdit.exercises.map((e, index) => {
            if (formType === 'template') {
                const exercise = e as TemplateExercise;
                return {
                    id: exercise.id,
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    notes: exercise.notes,
                    weight: exercise.weight,
                    orderIndex: index
                };
            } else {
                const exercise = e as PlanExercise;
                return {
                    id: exercise.id,
                    name: exercise.baseExercise?.name || '',
                    baseExerciseId: exercise.baseExerciseId,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    notes: exercise.notes,
                    orderIndex: index
                };
            }
        });
    });

    // Fetch base exercises if in plan mode
    const { data: baseExercises } = useQuery<BaseExercise[]>({
        queryKey: ['baseExercises'],
        queryFn: async () => {
            if (formType !== 'plan') return [];
            const response = await axios.get('/api/exercises', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        },
        enabled: formType === 'plan'
    });

    const createMutation = useMutation({
        mutationFn: async (data: MutationData) => {
            let endpoint = formType === 'template'
                ? '/api/workout-templates'
                : clientId
                    ? `/api/trainer-workouts/clients/${clientId}/plans`
                    : '/api/workout-plans';

            if (templateToEdit) {
                endpoint = formType === 'template'
                    ? `/api/workout-templates/${templateToEdit.id}`
                    : clientId
                        ? `/api/trainer-workouts/plans/${templateToEdit.id}`
                        : `/api/workout-plans/${templateToEdit.id}`;
            }

            let formattedExercises: FormattedExercise[];
            if (formType === 'template') {
                formattedExercises = data.exercises.map(exercise => ({
                    id: exercise.id,
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    notes: exercise.notes,
                    orderIndex: exercise.orderIndex
                }));
            } else {
                formattedExercises = data.exercises.map(exercise => ({
                    id: exercise.id,
                    baseExerciseId: exercise.baseExerciseId,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    notes: exercise.notes,
                    orderIndex: exercise.orderIndex
                }));
            }

            const method = templateToEdit ? 'put' : 'post';
            const requestData = {
                ...data,
                exercises: formattedExercises,
                clientId: clientId // Dodajemy clientId do wysyłanych danych
            };

            const response = await axios[method](
                endpoint,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            const queryKey = clientId
                ? ['clientWorkoutPlans', clientId]
                : [formType === 'template' ? 'workoutTemplates' : 'userWorkoutPlans'];

            queryClient.invalidateQueries({ queryKey });
            onClose();
        },
        onError: (error: AxiosError<ApiError>) => {
            alert(error.response?.data?.error || 'Failed to save workout plan');
        }
    });

    const handleAddExercise = () => {
        setExercises(prev => [
            ...prev,
            {
                name: '',
                sets: 3,
                reps: 10,
                notes: '',
                orderIndex: prev.length,
                ...(formType === 'plan' && baseExercises?.[0]?.id
                    ? { baseExerciseId: baseExercises[0].id }
                    : {})
            }
        ]);
    };

    const handleExerciseChange = (
        index: number,
        field: keyof FormExercise,
        value: string | number
    ) => {
        setExercises(prev => {
            const newExercises = [...prev];
            if (field === 'baseExerciseId' && formType === 'plan') {
                const selectedExercise = baseExercises?.find(ex => ex.id === Number(value));
                newExercises[index] = {
                    ...newExercises[index],
                    baseExerciseId: Number(value),
                    name: selectedExercise?.name || ''
                };
            } else {
                newExercises[index] = {
                    ...newExercises[index],
                    [field]: field === 'sets' || field === 'reps' || field === 'weight'
                        ? Number(value)
                        : value
                };
            }
            return newExercises;
        });
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(prev =>
            prev.filter((_, i) => i !== index)
                .map((ex, i) => ({ ...ex, orderIndex: i }))
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (exercises.length === 0) {
            alert('Please add at least one exercise');
            return;
        }
        createMutation.mutate({ name, description, exercises });
    };

    return (
        <div className="template-form-overlay" onClick={onClose}>
            <div className="template-form" onClick={e => e.stopPropagation()}>
                <h3>
                    {templateToEdit
                        ? `Edit ${formType === 'template' ? 'Template' : 'Plan'}`
                        : `Create New ${formType === 'template' ? 'Template' : 'Plan'}`}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder={`Enter ${formType} name`}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={`Describe your ${formType}`}
                            rows={3}
                        />
                    </div>

                    <div className="exercises-form">
                        <h4>Exercises</h4>
                        {exercises.map((exercise, index) => (
                            <div key={index} className="exercise-form-group">
                                <div className="exercise-header">
                                    <h5>Exercise {index + 1}</h5>
                                    <button
                                        type="button"
                                        className="remove-exercise"
                                        onClick={() => handleRemoveExercise(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="exercise-inputs">
                                    {formType === 'plan' ? (
                                        <div className="input-group">
                                            <label htmlFor={`exercise-base-${index}`}>Exercise:</label>
                                            <select
                                                id={`exercise-base-${index}`}
                                                value={exercise.baseExerciseId}
                                                onChange={(e) => handleExerciseChange(index, 'baseExerciseId', e.target.value)}
                                                required
                                            >
                                                <option value="">Select exercise</option>
                                                {baseExercises?.map(ex => (
                                                    <option key={ex.id} value={ex.id}>
                                                        {ex.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="input-group">
                                            <label htmlFor={`exercise-name-${index}`}>Name:</label>
                                            <input
                                                id={`exercise-name-${index}`}
                                                value={exercise.name}
                                                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                                required
                                                placeholder="Exercise name"
                                            />
                                        </div>
                                    )}
                                    <div className="exercise-details">
                                        <div className="input-group">
                                            <label htmlFor={`exercise-sets-${index}`}>Sets:</label>
                                            <input
                                                id={`exercise-sets-${index}`}
                                                type="number"
                                                min="1"
                                                value={exercise.sets}
                                                onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor={`exercise-reps-${index}`}>Reps:</label>
                                            <input
                                                id={`exercise-reps-${index}`}
                                                type="number"
                                                min="1"
                                                value={exercise.reps}
                                                onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {formType === 'plan' && (
                                            <div className="input-group">
                                                <label htmlFor={`exercise-weight-${index}`}>Weight (kg):</label>
                                                <input
                                                    id={`exercise-weight-${index}`}
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={exercise.weight || ''}
                                                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="input-group full-width">
                                        <label htmlFor={`exercise-notes-${index}`}>Notes:</label>
                                        <textarea
                                            id={`exercise-notes-${index}`}
                                            value={exercise.notes || ''}
                                            onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                            placeholder="Additional notes (optional)"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="add-exercise-button"
                            onClick={handleAddExercise}
                        >
                            Add Exercise
                        </button>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending
                                ? 'Saving...'
                                : templateToEdit
                                    ? `Update ${formType === 'template' ? 'Template' : 'Plan'}`
                                    : `Create ${formType === 'template' ? 'Template' : 'Plan'}`
                            }
                        </button>
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};