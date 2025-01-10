import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import './ProgressDashboard.scss';

interface Props {
    type: 'measurements' | 'exercises';
}

interface Measurements {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
}

interface MeasurementStats {
    current: {
        weight?: number;
        measurements?: Measurements;
    };
    changes: {
        weight?: number;
        measurements?: Measurements;
    };
}

interface ExerciseStats {
    maxWeight: number;
    lastWeight: number;
    bestSeries: {
        weight: number;
        reps: number;
        date: string;
    } | null;
    progressLastMonth: number;
    totalSessions: number;
}

const ProgressDashboard: React.FC<Props> = ({ type }) => {
    const [stats, setStats] = useState<MeasurementStats | ExerciseStats | null>(null);

    // Reszta kodu pozostaje bez zmian

    const renderMeasurementsDashboard = () => {
        const measurementStats = stats as MeasurementStats;
        if (!measurementStats) return null;

        return (
            <div className="stats-grid measurements">
                <div className="stat-card">
                    <h3>Waga</h3>
                    <div className="stat-content">
                        <div className="current-value">
                            {measurementStats.current.weight?.toFixed(1) || '-'} kg
                        </div>
                        <div className="trend">
                            {renderTrendIcon(measurementStats.changes.weight)}
                            <span className={getTrendClass(measurementStats.changes.weight)}>
                                {measurementStats.changes.weight?.toFixed(1) || '0'} kg
                            </span>
                        </div>
                    </div>
                </div>

                {measurementStats.current.measurements &&
                    Object.entries(measurementStats.current.measurements).map(([key, value]) => (
                        <div key={key} className="stat-card">
                            <h3>{key}</h3>
                            <div className="stat-content">
                                <div className="current-value">
                                    {value?.toFixed(1) || '-'} cm
                                </div>
                                <div className="trend">
                                    {renderTrendIcon(measurementStats.changes.measurements?.[key as keyof Measurements])}
                                    <span className={getTrendClass(measurementStats.changes.measurements?.[key as keyof Measurements])}>
                                        {measurementStats.changes.measurements?.[key as keyof Measurements]?.toFixed(1) || '0'} cm
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

    const renderExerciseDashboard = () => {
        const exerciseStats = stats as ExerciseStats;
        if (!exerciseStats) return null;

        return (
            <div className="stats-grid exercises">
            </div>
        );
    };

    const fetchStats = async () => {
        try {
            const endpoint = type === 'measurements' ? 'measurements' : 'exercise';
            const response = await fetch(`http://localhost:3000/api/progress/${endpoint}/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const renderTrendIcon = (change: number | undefined) => {
        if (!change) return <Minus className="trend-icon neutral" />;
        if (change > 0) return <ArrowUp className="trend-icon up" />;
        return <ArrowDown className="trend-icon down" />;
    };

    const getTrendClass = (value: number | undefined): string => {
        if (!value) return 'trend-value neutral';
        return value > 0 ? 'trend-value up' : 'trend-value down';
    };

    useEffect(() => {
        fetchStats();
    }, [type]);

    if (!stats) {
        return <div className="loading">Ładowanie...</div>;
    }

    return (
        <div className="progress-dashboard">
            <h2 className="dashboard-title">
                {type === 'measurements' ? 'Podsumowanie pomiarów' : 'Podsumowanie ćwiczeń'}
            </h2>
            {type === 'measurements' ? renderMeasurementsDashboard() : renderExerciseDashboard()}
        </div>
    );
};

export default ProgressDashboard;