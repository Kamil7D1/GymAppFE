// components/MembershipPurchase/MembershipPurchase.tsx
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './MembershipPurchase.scss';

interface MembershipOption {
    type: 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL';
    price: number;
    duration: string;
    description: string;
}

const MEMBERSHIP_OPTIONS: MembershipOption[] = [
    {
        type: 'MONTHLY',
        price: 50,
        duration: '1 Month',
        description: 'Perfect for trying out our gym'
    },
    {
        type: 'SEMI_ANNUAL',
        price: 45,
        duration: '6 Months',
        description: 'Most popular choice'
    },
    {
        type: 'ANNUAL',
        price: 40,
        duration: '12 Months',
        description: 'Best value for committed members'
    }
];

export const MembershipPurchase: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: currentMembership, isLoading } = useQuery({
        queryKey: ['membership'],
        queryFn: async () => {
            const response = await axios.get('/api/memberships/current', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    const purchaseMutation = useMutation({
        mutationFn: async (type: string) => {
            const response = await axios.post(
                '/api/memberships/purchase',
                { type },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
        }
    });

    const handlePurchase = (type: string) => {
        if (window.confirm('Are you sure you want to purchase this membership?')) {
            purchaseMutation.mutate(type);
        }
    };

    if (isLoading) {
        return <div className="membership-loading">Loading...</div>;
    }

    if (currentMembership) {
        return (
            <div className="current-membership">
                <h2>Your Current Membership</h2>
                <div className="membership-details">
                    <p>Type: {currentMembership.type}</p>
                    <p>Valid until: {new Date(currentMembership.endDate).toLocaleDateString()}</p>
                    <p>Price: ${currentMembership.price}/month</p>
                </div>
            </div>
        );
    }

    return (
        <div className="membership-purchase">
            <h2>Choose Your Membership Plan</h2>
            <div className="membership-options">
                {MEMBERSHIP_OPTIONS.map((option) => (
                    <div key={option.type} className="membership-card">
                        <h3>{option.duration}</h3>
                        <div className="price">
                            <span className="amount">${option.price}</span>
                            <span className="period">/month</span>
                        </div>
                        <p className="description">{option.description}</p>
                        <button
                            className="purchase-button"
                            onClick={() => handlePurchase(option.type)}
                            disabled={purchaseMutation.isPending}
                        >
                            {purchaseMutation.isPending ? 'Processing...' : 'Purchase Now'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};