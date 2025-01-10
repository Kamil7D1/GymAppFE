import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import './UserProfile.scss';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    weight?: number;
    height?: number;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}

export const UserProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [formData, setFormData] = useState<UserData>({
        firstName: '',
        lastName: '',
        email: '',
        age: undefined,
        weight: undefined,
        height: undefined
    });
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const { data: user, refetch } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await axios.get('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setFormData(response.data);
            return response.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: UserData) => {
            const response = await axios.put('/api/users/me', data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }

            return response;
        },
        onSuccess: () => {
            refetch();
            setIsEditing(false);
            setError(null);
        },
        onError: (error: any) => {
            setError(error.response?.data?.error || 'An error occurred');
        }
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async (data: Omit<PasswordData, 'newPasswordConfirm'>) => {
            return axios.put('/api/users/me/password', data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        },
        onSuccess: () => {
            setPasswordSuccess('Password updated successfully');
            setPasswordError(null);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                newPasswordConfirm: ''
            });
            setTimeout(() => {
                setPasswordModalOpen(false);
                setPasswordSuccess(null);
            }, 2000);
        },
        onError: (error: any) => {
            setPasswordError(error.response?.data?.error || 'An error occurred');
        }
    });

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long');
            return;
        }

        updatePasswordMutation.mutate({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    return (
        <div className="user-profile-page">
            <div className="profile-container">
                <h2>My Profile</h2>
                {error && <div className="error-message">{error}</div>}

                {!isEditing ? (
                    <div className="profile-data">
                        <div className="data-section">
                            <h4>Account Information</h4>
                            <div className="data-field">
                                <label>Email</label>
                                <p>{user?.email}</p>
                            </div>
                            <div className="data-field">
                                <label>Name</label>
                                <p>{user?.firstName} {user?.lastName}</p>
                            </div>
                            <div className="data-field">
                                <label>Age</label>
                                <p>{user?.age || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="data-section">
                            <h4>Body Measurements</h4>
                            <div className="data-field">
                                <label>Weight (kg)</label>
                                <p>{user?.weight || 'Not set'}</p>
                            </div>
                            <div className="data-field">
                                <label>Height (cm)</label>
                                <p>{user?.height || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                className="edit-button"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                            <button
                                className="change-password-button"
                                onClick={() => setPasswordModalOpen(true)}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h4>Account Information</h4>
                            <div className="form-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>First Name</label>
                                <input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>Last Name</label>
                                <input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label>Age</label>
                                <input
                                    type="number"
                                    value={formData.age || ''}
                                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || undefined})}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h4>Body Measurements</h4>
                            <div className="form-field">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.weight || ''}
                                    onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || undefined})}
                                />
                            </div>
                            <div className="form-field">
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.height || ''}
                                    onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || undefined})}
                                />
                            </div>
                        </div>

                        <div className="button-group">
                            <button type="submit">Save Changes</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData(user || formData);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {passwordModalOpen && (
                    <div className="password-modal">
                        <div className="password-modal-content">
                            <h3>Change Password</h3>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                            <form onSubmit={handleUpdatePassword}>
                                <div className="form-field">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            currentPassword: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPasswordConfirm}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            newPasswordConfirm: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="button-group">
                                    <button type="submit">Update Password</button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPasswordModalOpen(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                newPasswordConfirm: ''
                                            });
                                            setPasswordError(null);
                                            setPasswordSuccess(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};