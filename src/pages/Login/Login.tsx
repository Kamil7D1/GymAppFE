import "./Login.scss";
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {AuthForm} from "../../components/AuthForm/AuthForm.tsx";
import React from "react";

interface AuthFormValues {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface LoginResponse {
    token: string;
}

export const Login: React.FC = () => {
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (values: AuthFormValues) =>
            axios.post<LoginResponse>('http://localhost:3000/api/auth/login', values),
        onSuccess: (response) => {
            localStorage.setItem('token', response.data.token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            navigate('/dashboard');
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                console.error('Login failed:', error.response?.data.error);
            }
        }
    });

    return (
        <div className="login-page">
            <AuthForm
                type="login"
                onSubmit={(values) => loginMutation.mutate(values)}
            />
        </div>
    );
};