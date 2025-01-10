import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './ProgressCharts.scss';

interface Props {
    type: 'measurements' | 'exercises';
}

interface BaseExercise {
    id: number;
    name: string;
    category: string;
}

interface ChartFilters {
    startDate: string;
    endDate: string;
    exerciseId?: number;
}

interface ProcessedMeasurement {
    date: string;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
}

const ProgressCharts: React.FC<Props> = ({ type }) => {
    const [data, setData] = useState<any[]>([]);
    const [exercises, setExercises] = useState<BaseExercise[]>([]);
    const [filters, setFilters] = useState<ChartFilters>({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const processMeasurementData = (rawData: any[]): ProcessedMeasurement[] => {
        return rawData
            .map(item => {
                const measurements = typeof item.measurements === 'string'
                    ? JSON.parse(item.measurements)
                    : item.measurements || {};
                return {
                    date: item.date,
                    weight: item.weight,
                    ...(measurements || {})
                };
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    useEffect(() => {
        if (type === 'exercises') {
            fetchExercises();
        }
        fetchData();
    }, [type]);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchExercises = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/exercises', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const exercisesList = await response.json();
                setExercises(exercisesList);
                if (exercisesList.length > 0) {
                    setFilters(prev => ({ ...prev, exerciseId: exercisesList[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    };

    const fetchData = async () => {
        try {
            const endpoint = type === 'measurements' ? 'measurements' : 'exercise';
            const queryParams = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                ...(filters.exerciseId && { exerciseId: filters.exerciseId.toString() })
            });

            const response = await fetch(`http://localhost:3000/api/progress/${endpoint}?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const jsonData = await response.json();
            console.log('Otrzymane dane:', jsonData);

            if (response.ok) {
                if (type === 'measurements') {
                    const processedData = processMeasurementData(jsonData);
                    console.log('Przetworzone dane:', processedData);
                    setData(processedData);
                } else {
                    setData(jsonData);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: name === 'exerciseId' ? parseInt(value) : value
        }));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const renderMeasurementsChart = () => {
        const measurementTypes = ['weight', 'chest', 'waist', 'hips', 'biceps', 'thighs'];
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00C49F'];

        return (
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    minTickGap={50}
                />
                <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    label={{ value: 'Wymiary (cm)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    label={{ value: 'Waga (kg)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => {
                        switch (name) {
                            case 'Weight':
                                return [`${value.toFixed(1)} kg`, 'Waga'];
                            case 'Chest':
                                return [`${value.toFixed(1)} cm`, 'Obwód klatki piersiowej'];
                            case 'Waist':
                                return [`${value.toFixed(1)} cm`, 'Obwód talii'];
                            case 'Hips':
                                return [`${value.toFixed(1)} cm`, 'Obwód bioder'];
                            case 'Biceps':
                                return [`${value.toFixed(1)} cm`, 'Obwód bicepsa'];
                            case 'Thighs':
                                return [`${value.toFixed(1)} cm`, 'Obwód uda'];
                            default:
                                return [value, name];
                        }
                    }}
                />
                <Legend />
                {measurementTypes.map((type, index) => (
                    <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        stroke={colors[index]}
                        yAxisId={type === 'weight' ? 'right' : 'left'}
                        name={type.charAt(0).toUpperCase() + type.slice(1)}
                        dot={false}
                        activeDot={{ r: 8 }}
                        connectNulls
                    />
                ))}
            </LineChart>
        );
    };

    const renderExerciseChart = () => {
        return (
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                />
                <YAxis
                    yAxisId="weight"
                    orientation="left"
                    stroke="#8884d8"
                    label={{ value: 'Ciężar (kg)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                    yAxisId="reps"
                    orientation="right"
                    stroke="#82ca9d"
                    label={{ value: 'Powtórzenia/Serie', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => {
                        switch (name) {
                            case 'Ciężar (kg)':
                                return [`${value.toFixed(1)} kg`, 'Ciężar'];
                            case 'Powtórzenia':
                                return [value, 'Powtórzenia'];
                            case 'Serie':
                                return [value, 'Serie'];
                            default:
                                return [value, name];
                        }
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#8884d8"
                    yAxisId="weight"
                    name="Ciężar (kg)"
                    dot={false}
                    activeDot={{ r: 8 }}
                />
                <Line
                    type="monotone"
                    dataKey="reps"
                    stroke="#82ca9d"
                    yAxisId="reps"
                    name="Powtórzenia"
                    dot={false}
                    activeDot={{ r: 8 }}
                />
                <Line
                    type="monotone"
                    dataKey="sets"
                    stroke="#ffc658"
                    yAxisId="reps"
                    name="Serie"
                    dot={false}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        );
    };

    return (
        <div className="progress-charts">
            <div className="filters-section">
                {type === 'exercises' && (
                    <div className="filter-group">
                        <label htmlFor="exerciseId">Ćwiczenie:</label>
                        <select
                            id="exerciseId"
                            name="exerciseId"
                            value={filters.exerciseId}
                            onChange={handleFilterChange}
                        >
                            {exercises.map(exercise => (
                                <option key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="filter-group">
                    <label htmlFor="startDate">Od:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="endDate">Do:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    {type === 'measurements' ? renderMeasurementsChart() : renderExerciseChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressCharts;