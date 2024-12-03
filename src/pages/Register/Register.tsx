import "./Register.scss";
import React from "react";
import {AuthForm} from "../../components/AuthForm/AuthForm.tsx";

export const Register: React.FC = () => {
    const handleSubmit = (values: any) => {
        console.log(values);
    };

    return (
        <div className="register-page">
            <AuthForm type="register" onSubmit={handleSubmit} />
        </div>
    );
};