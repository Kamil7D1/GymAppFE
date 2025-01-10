import "./Dashboard.scss";
import React from "react";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MainLayout } from "../../MainLayout/MainLayout.tsx";
import { MembershipPurchase } from "../../components/MembershipPurchase/MembershipPurchase.tsx";
import { Link, Outlet, NavLink } from "react-router-dom";
import {Activity, Dumbbell, Calendar as CalendarIcon, Users, BookOpen, User} from 'lucide-react';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    memberSince: string;
    age?: number;
    weight?: number;
    height?: number;
}

export const Dashboard: React.FC = () => {
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await axios.get<User>('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });

    return (
        <MainLayout>
            <div className="dashboard-page">
                <div className="dashboard-page__container">
                    <div className="dashboard-page__welcome">
                        <img className="dashboard-page__avatar" src="/avatar.png" alt="Profile"/>
                        <div className="dashboard-page__info">
                            <div className="dashboard-page__welcome-text header--primary">Welcome,</div>
                            <div className="dashboard-page__username header--secondary">
                                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                            </div>
                            <div className="dashboard-page__member-date paragraph--gray">
                                Member since {user?.memberSince}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-actions">
                        <Link to="/my-plans" className="dashboard-action-button">
                            <Dumbbell className="action-icon"/>
                            My Workout Plans
                        </Link>
                        <Link to="/progress" className="dashboard-action-button">
                            <Activity className="action-icon"/>
                            Track Progress
                        </Link>
                        <Link to="/profile" className="dashboard-action-button">
                            <User className="action-icon"/>
                            My Profile
                        </Link>
                    </div>

                    <div className="dashboard-page__membership-section">
                        <MembershipPurchase/>
                    </div>

                    <div className="dashboard-tabs">
                        <NavLink
                            to="/dashboard/calendar"
                            className={({isActive}) =>
                                `dashboard-tab ${isActive ? 'active' : ''}`
                            }
                        >
                            <CalendarIcon className="tab-icon"/>
                            Calendar
                        </NavLink>
                        <NavLink
                            to="/dashboard/my-bookings"
                            className={({isActive}) =>
                                `dashboard-tab ${isActive ? 'active' : ''}`
                            }
                        >
                            <BookOpen className="tab-icon"/>
                            My Bookings
                        </NavLink>
                        <NavLink
                            to="/dashboard/trainers"
                            className={({isActive}) =>
                                `dashboard-tab ${isActive ? 'active' : ''}`
                            }
                        >
                            <Users className="tab-icon"/>
                            Trainers
                        </NavLink>
                    </div>
                    <div className="dashboard-content">
                        <Outlet/>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};