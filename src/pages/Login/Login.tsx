import {AuthForm} from "../../components/AuthForm/AuthForm.tsx";
import React from "react";
import "./Login.scss";

interface AuthFormValues {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export const Login: React.FC = () => {
    const handleSubmit = (values: AuthFormValues) => {
        console.log(values);
    };

    return (
        <div className="login-page">
            <AuthForm type="login" onSubmit={handleSubmit} />
        </div>
    );
};