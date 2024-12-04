import "./Dashboard.scss";
import React from "react";
import {MainLayout} from "../../MainLayout/MainLayout.tsx";

export const Dashboard: React.FC = () => {
    return (
        <MainLayout>
            <div className="dashboard-page">
                <div className="dashboard-page__container">
                    <div className="dashboard-page__welcome">
                        <img className="dashboard-page__avatar" src="/avatar.png" alt="Profile"/>
                        <div className="dashboard-page__info">
                            <div className="dashboard-page__welcome-text header--primary">Welcome,</div>
                            <div className="dashboard-page__username header--secondary">Kamil Czudaj</div>
                            <div className="dashboard-page__member-date paragraph--gray">Member since 03.12.204</div>
                        </div>
                    </div>

                    <div className="dashboard-page__stats">
                        <div className="dashboard-page__stats-item">27 years</div>
                        <div className="dashboard-page__stats-item">76 kg</div>
                        <div className="dashboard-page__stats-item">180 cm</div>
                    </div>

                    <div className="dashboard-page__membership">
                        <h3 className="dashboard-page__membership-title header--tertiary">Your Membership</h3>
                        <div className="dashboard-page__membership-duration">
                            <p className="paragraph--black">
                                Duration:
                                <span>
                                    {" "}6 Months
                                </span>
                            </p>
                        </div>
                        <div className="dashboard-page__membership-status">
                            <p className="paragraph--black">
                            Active - Valid until:
                                <span>
                                    {" "}31.12.2024
                                </span>
                            </p>
                        </div>
                        <div className="dashboard-page__membership-id">
                            <p className="paragraph--black">
                                <span>
                                    #D24HKL34
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};