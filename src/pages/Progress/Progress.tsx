import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import MeasurementForm from '../../components/Progress/MeasurmentForm/MeasurementForm';
import ExerciseProgressForm from '../../components/Progress/ExerciseProgressForm/ExerciseProgressForm';
import ProgressDashboard from '../../components/Progress/ProgressDashboard/ProgressDashboard';
import ProgressCharts from '../../components/Progress/ProgressCharts/ProgressCharts';
import './Progress.scss';
import {MainLayout} from "../../MainLayout/MainLayout.tsx";

export const Progress: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        { name: 'Pomiary', id: 'measurements' },
        { name: 'Postęp Ćwiczeń', id: 'exercises' }
    ];

    return (
        <MainLayout>
        <div className="progress-container">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="tab-list">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            className={({ selected }) =>
                                `tab ${selected ? 'tab-selected' : ''}`
                            }
                        >
                            {tab.name}
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels>
                    <Tab.Panel>
                        <div className="dashboard-section">
                            <ProgressDashboard type="measurements" />
                            <ProgressCharts type="measurements" />
                            <MeasurementForm />
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <div className="dashboard-section">
                            <ProgressDashboard type="exercises" />
                            <ProgressCharts type="exercises" />
                            <ExerciseProgressForm />
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
        </MainLayout>
    );
};