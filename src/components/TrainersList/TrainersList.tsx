// components/TrainersList/TrainersList.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import './TrainersList.scss';
import { BookPersonalTrainingModal } from '../BookPersonalTrainingModal/BookPersonalTrainingModal';

interface Trainer {
    id: number;
    firstName: string;
    lastName: string;
    specialization: string;
    description: string;
    photoUrl: string;
    rating: number;
    pricePerSession: number;
}

export const TrainersList: React.FC = () => {
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: trainers, isLoading, error } = useQuery<Trainer[]>({
        queryKey: ['trainers'],
        queryFn: async () => {
            const response = await axios.get('/api/trainer/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const handleBookTraining = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="trainers-list__loading">Loading trainers...</div>;
    if (error) return <div className="trainers-list__error">Error loading trainers</div>;

    return (
        <div className="trainers-list">
            <h2 className="trainers-list__title header--secondary">Personal Trainers</h2>
            <div className="trainers-list__container">
                {trainers?.map(trainer => (
                    <div key={trainer.id} className="trainer-card">
                        <img
                            src={trainer.photoUrl || '/placeholder-trainer.jpg'}
                            alt={`${trainer.firstName} ${trainer.lastName}`}
                            className="trainer-card__photo"
                        />
                        <div className="trainer-card__content">
                            <h3 className="trainer-card__name">
                                {trainer.firstName} {trainer.lastName}
                            </h3>
                            <p className="trainer-card__specialization">
                                {trainer.specialization}
                            </p>
                            <p className="trainer-card__description">
                                {trainer.description}
                            </p>
                            <div className="trainer-card__footer">
                                <span className="trainer-card__price">
                                    ${trainer.pricePerSession}/session
                                </span>
                                <button
                                    className="trainer-card__book-btn"
                                    onClick={() => handleBookTraining(trainer)}
                                >
                                    Book Training
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTrainer && (
                <BookPersonalTrainingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    trainer={selectedTrainer}
                />
            )}
        </div>
    );
};