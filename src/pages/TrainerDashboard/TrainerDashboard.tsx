import "./TrainerDashboard.scss";
import { Calendar } from "../../components/Calendar/Calendar.tsx";
import { AddSessionModal } from "../../components/AddSessionModal/AddSessionModal.tsx";
import { useState } from "react";
import { SessionsList } from "../../components/SessionsList/SessionsList.tsx";
import { useNavigate } from "react-router-dom";
import {MainLayout} from "../../MainLayout/MainLayout.tsx";

export const TrainerDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSessionsList, setShowSessionsList] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <MainLayout>
            <div className="trainer-dashboard">
                <aside className="trainer-dashboard__sidebar">
                    <div className="trainer-dashboard__profile">
                        <img src="/placeholder-avatar.jpg" alt="Trainer"/>
                        <h2>Trainer Name</h2>
                        <p>Specialization</p>
                    </div>
                    <div className="trainer-dashboard__stats">
                        <h3>This Week</h3>
                        <div className="stat">
                            <span>Classes</span>
                            <span>12</span>
                        </div>
                        <div className="stat">
                            <span>Students</span>
                            <span>45</span>
                        </div>
                    </div>
                    <button
                        className="trainer-dashboard__add-session"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add New Session
                    </button>
                    <button
                        className="trainer-dashboard__view-sessions"
                        onClick={() => setShowSessionsList(!showSessionsList)}
                    >
                        {showSessionsList ? 'Hide Sessions' : 'View Sessions'}
                    </button>
                    <button
                        className="trainer-dashboard__logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                    <AddSessionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </aside>
                <main className="trainer-dashboard__main">
                    <Calendar/>
                    <SessionsList/>
                </main>
            </div>
        </MainLayout>
    );
};