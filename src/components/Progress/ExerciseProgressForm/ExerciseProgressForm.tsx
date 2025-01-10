import React, { useState, useEffect } from 'react';
import './ExerciseProgressForm.scss';

interface BaseExercise {
    id: number;
    name: string;
    category: string;
}

interface ExerciseProgress {
    exerciseId: number;
    date: string;
    weight: number;
    reps: number;
    sets: number;
}

const ExerciseProgressForm: React.FC = () => {
    const [exercises, setExercises] = useState<BaseExercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ExerciseProgress>({
        exerciseId: 0,
        date: new Date().toISOString().split('T')[0],
        weight: 0,
        reps: 0,
        sets: 0
    });

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/exercises', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Nie udało się pobrać listy ćwiczeń');

            const data = await response.json();
            setExercises(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, exerciseId: data[0].id }));
            }
        } catch (err) {
            setError('Wystąpił błąd podczas pobierania listy ćwiczeń');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/progress/exercise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Błąd podczas zapisywania postępu');

            setFormData({
                exerciseId: formData.exerciseId, // zachowujemy wybrane ćwiczenie
                date: new Date().toISOString().split('T')[0],
                weight: 0,
                reps: 0,
                sets: 0
            });
            alert('Postęp został zapisany!');
        } catch (error) {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas zapisywania postępu');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'exerciseId' ? parseInt(value) :
                name === 'date' ? value :
                    parseFloat(value)
        }));
    };

    if (isLoading) return <div className="loading">Ładowanie listy ćwiczeń...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="exercise-progress-form">
            <h2>Dodaj postęp ćwiczenia</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="exerciseId">Ćwiczenie:</label>
                    <select
                        id="exerciseId"
                        name="exerciseId"
                        value={formData.exerciseId}
                        onChange={handleInputChange}
                        required
                    >
                        {exercises.map(exercise => (
                            <option key={exercise.id} value={exercise.id}>
                                {exercise.name} ({exercise.category})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="date">Data:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="weight">Ciężar (kg):</label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            step="0.5"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="reps">Powtórzenia:</label>
                        <input
                            type="number"
                            id="reps"
                            name="reps"
                            value={formData.reps}
                            onChange={handleInputChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="sets">Serie:</label>
                        <input
                            type="number"
                            id="sets"
                            name="sets"
                            value={formData.sets}
                            onChange={handleInputChange}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <button type="submit">Zapisz postęp</button>
            </form>
        </div>
    );
};

export default ExerciseProgressForm;