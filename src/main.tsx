import {ReactNode, StrictMode} from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import {createBrowserRouter, Navigate, redirect, RouterProvider} from "react-router-dom";
import {Login} from "./pages/Login/Login.tsx";
import {Register} from "./pages/Register/Register.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Dashboard} from "./pages/Dashboard/Dashboard.tsx";
import {TrainerDashboard} from "./pages/TrainerDashboard/TrainerDashboard.tsx";
import {jwtDecode} from "jwt-decode";

interface ProtectedRouteProps {
    role: string;
    children: ReactNode;
}

function ProtectedRoute({ role, children }: ProtectedRouteProps) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    try {
        const decodedToken = jwtDecode(token) as { role: string };
        if (decodedToken.role !== role) {
            return <Navigate to="/dashboard" />;
        }
    } catch {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>
    },
    {
        path: "login",
        element: <Login/>
    },
    {
        path: "register",
        element: <Register/>
    },
    {
        path: "/dashboard",
        element: <Dashboard />,
        loader: async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                throw redirect('/login');
            }
            return null;
        },
        errorElement: <Navigate to="/login" />
    },
    {
        path: "/trainer-dashboard",
        element: <ProtectedRoute role="TRAINER"><TrainerDashboard /></ProtectedRoute>
    }
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    </StrictMode>,
);