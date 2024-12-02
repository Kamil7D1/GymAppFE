import "./Login.scss";
import React from "react";
import {AuthForm} from "../../components/AuthForm/AuthForm.tsx";

export const Login : React.FC = () => {
    return (
        <div className="login-page">
            <AuthForm/>
        </div>
    );
};