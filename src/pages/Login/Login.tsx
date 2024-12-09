import "./Login.scss";
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {AuthForm} from "../../components/AuthForm/AuthForm.tsx";
import React from "react";
import {jwtDecode, JwtPayload} from "jwt-decode";

interface AuthFormValues {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface LoginResponse {
    token: string;
}

interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    role?: string;
}

export const Login: React.FC = () => {
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (values: AuthFormValues) =>
            axios.post<LoginResponse>('http://localhost:3000/api/auth/login', values),
        onSuccess: (response) => {
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            const decodedToken = jwtDecode<DecodedToken>(response.data.token);
            console.log('Decoded token:', decodedToken); // Dodaj to
            console.log('User role:', decodedToken.role); // Dodaj to

            if (decodedToken.role === 'TRAINER') {
                console.log('Redirecting to trainer dashboard'); // Dodaj to
                navigate('/trainer-dashboard');
            } else {
                console.log('Redirecting to user dashboard'); // Dodaj to
                navigate('/dashboard');
            }
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