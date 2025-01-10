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
import {WorkoutPlanList} from "./components/WorkoutPlanList/WorkoutPlanList.tsx";
import {TrainerWorkoutPlans} from "./components/TrainerWorkoutPlans/TrainerWorkoutPlans.tsx";
import {UserWorkoutPlans} from "./components/UserWorkoutPlans/UserWorkoutPlans.tsx";
import {SocketProvider} from "./context/SocketContext.tsx";
import {Progress} from './pages/Progress/Progress.tsx';
import {TrainersList} from "./components/TrainersList/TrainersList.tsx";
import {Calendar} from "./components/Calendar/Calendar.tsx";
import {MyBookings} from "./components/MyBookings/MyBookings.tsx";
import {UserProfile} from "./components/UserProfile/UserProfile.tsx";

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
        errorElement: <Navigate to="/login" />,
        children: [
            {
                path: "",
                element: <Navigate to="calendar" />,
            },
            {
                path: "calendar",
                element: <Calendar />,
            },
            {
                path: "my-bookings",
                element: <MyBookings />,
            },
            {
                path: "trainers",
                element: <TrainersList />,
            }
        ]
    },
    {
        path: "/trainer-dashboard",
        element: <ProtectedRoute role="TRAINER"><TrainerDashboard /></ProtectedRoute>
    },
    {
        path: "/workout-plans",
        element: (
            <ProtectedRoute role="USER">
                <WorkoutPlanList />
            </ProtectedRoute>
        ),
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
        path: "/trainer/workout-plans",
        element: <ProtectedRoute role="TRAINER"><TrainerWorkoutPlans /></ProtectedRoute>
    },
    {
        path: "/my-plans",
        element: <UserWorkoutPlans />
    },
    {
        path: "/progress",
        element: (
            <ProtectedRoute role="USER">
                <Progress />
            </ProtectedRoute>
        ),
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
        path: "/profile",
        element: (
            <ProtectedRoute role="USER">
                <UserProfile />
            </ProtectedRoute>
        ),
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
        path: "/trainer/progress/:userId",
        element: (
            <ProtectedRoute role="TRAINER">
                <Progress />
            </ProtectedRoute>
        ),
        loader: async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                throw redirect('/login');
            }
            return null;
        },
        errorElement: <Navigate to="/login" />
    }
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <RouterProvider router={router}/>
            </SocketProvider>
        </QueryClientProvider>
    </StrictMode>,
);