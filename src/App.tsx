import './App.scss';
import * as React from "react";
import { MainLayout } from "./MainLayout/MainLayout.tsx";
import { Home } from "./pages/Home/Home.tsx";
import axios from "axios";
import { SocketProvider } from './context/SocketContext.tsx';

export const App: React.FC = () => {
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return (
        <SocketProvider>
            <MainLayout>
                <Home/>
            </MainLayout>
        </SocketProvider>
    );
};