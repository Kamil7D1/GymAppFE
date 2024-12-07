import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import {createBrowserRouter, Navigate, redirect, RouterProvider} from "react-router-dom";
import {Login} from "./pages/Login/Login.tsx";
import {Register} from "./pages/Register/Register.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Dashboard} from "./pages/Dashboard/Dashboard.tsx";

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