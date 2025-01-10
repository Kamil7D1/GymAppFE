import React, { useState, FormEvent, ChangeEvent } from 'react';
import './MeasurementForm.scss';

interface Measurements {
    chest: string;
    waist: string;
    hips: string;
    biceps: string;
    thighs: string;
}

interface FormData {
    date: string;
    weight: string;
    measurements: Measurements;
}

interface CleanMeasurements {
    [key: string]: number;
}

const MeasurementForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        measurements: {
            chest: '',
            waist: '',
            hips: '',
            biceps: '',
            thighs: ''
        }
    });
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nie znaleziono tokenu autoryzacji');
            }

            // Przygotuj dane do wysłania - usuń puste wartości
            const cleanMeasurements: CleanMeasurements = {};
            Object.entries(formData.measurements).forEach(([key, value]) => {
                if (value !== '') {
                    cleanMeasurements[key] = parseFloat(value);
                }
            });

            const dataToSend = {
                date: formData.date,
                measurements: Object.keys(cleanMeasurements).length > 0 ? JSON.stringify(cleanMeasurements) : null,
                weight: formData.weight ? parseFloat(formData.weight) : undefined
            };

            console.log('Wysyłane dane:', dataToSend);

            const response = await fetch('http://localhost:3000/api/progress/measurements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();
            console.log('Odpowiedź serwera:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Wystąpił błąd podczas zapisywania pomiarów');
            }

            setSuccess(true);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                weight: '',
                measurements: {
                    chest: '',
                    waist: '',
                    hips: '',
                    biceps: '',
                    thighs: ''
                }
            });
        } catch (err) {
            console.error('Szczegóły błędu:', err);
            setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'date' || name === 'weight') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                measurements: {
                    ...prev.measurements,
                    [name]: value
                }
            }));
        }
    };

    return (
        <div className="measurement-form">
            <h2>Dodaj nowe pomiary</h2>

            {error && (
                <div className="alert error">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="alert success">
                    <p>Pomiary zostały pomyślnie zapisane!</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="date">Data pomiaru:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="weight">Waga (kg):</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        placeholder="np. 75.5"
                    />
                </div>

                <div className="measurements-group">
                    <h3>Wymiary (cm):</h3>
                    {(Object.keys(formData.measurements) as Array<keyof Measurements>).map(measurement => (
                        <div key={measurement} className="form-group">
                            <label htmlFor={measurement}>
                                {measurement.charAt(0).toUpperCase() + measurement.slice(1)}:
                            </label>
                            <input
                                type="number"
                                id={measurement}
                                name={measurement}
                                value={formData.measurements[measurement]}
                                onChange={handleInputChange}
                                step="0.1"
                                min="0"
                                placeholder="np. 90.5"
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Zapisywanie...' : 'Zapisz pomiary'}
                </button>
            </form>
        </div>
    );
};

export default MeasurementForm;