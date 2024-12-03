import "./AuthForm.scss";
import {Button} from "../Button/Button.tsx";
import {Input} from "../Input/Input.tsx";
import React from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

interface AuthForm {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface AuthFormProps {
    type: 'login' | 'register';
    onSubmit: (values: AuthForm) => void;
}

interface FormValues {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit }) => {
    const isLogin = type === 'login';

    const initialValues: FormValues = {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required"),
        password: Yup.string()
            .required("Password is required")
            .min(8, "Password must be at least 8 characters")
            .matches(/[a-zA-Z]/, "Password must contain letters"),
        ...(isLogin ? {} : {
            firstName: Yup.string().required("First name is required"),
            lastName: Yup.string().required("Last name is required")
        })
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit
    });

    return (
        <form className="auth-form" onSubmit={formik.handleSubmit}>
            <h1 className="auth-form__title header--primary">
                {isLogin ? 'Login' : 'Register'}
            </h1>

            {!isLogin && (
                <>
                    <div className="auth-form__input-container">
                        <Input
                            id="firstName"
                            name="firstName"
                            placeholder="First Name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.firstName}
                            className="auth-form__input"
                        />
                        {formik.touched.firstName && formik.errors.firstName ? (
                            <p className="auth-form__error">{formik.errors.firstName}</p>
                        ) : null}
                    </div>
                    <div className="auth-form__input-container">
                        <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Last Name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.lastName}
                            className="auth-form__input"
                        />
                        {formik.touched.lastName && formik.errors.lastName ? (
                            <p className="auth-form__error">{formik.errors.lastName}</p>
                        ) : null}
                    </div>
                </>
            )}

            <div className="auth-form__input-container">
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className="auth-form__input auth-form__input--email"
                />
                {formik.touched.email && formik.errors.email ? (
                    <p className="auth-form__error">{formik.errors.email}</p>
                ) : null}
            </div>

            <div className="auth-form__input-container">
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className="auth-form__input auth-form__input--password"
                />
                {formik.touched.password && formik.errors.password ? (
                    <p className="auth-form__error">{formik.errors.password}</p>
                ) : null}
            </div>

            {isLogin && (
                <p className="auth-form__forgot-password paragraph">
         <span className="auth-form__forgot-password-link">
           Forgot Password?
         </span>
                </p>
            )}

            <Button className="auth-form__submit-button" type="submit">
                {isLogin ? 'LOGIN' : 'REGISTER'}
            </Button>

            <p className="auth-form__signup-text paragraph">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span className="auth-form__signup-link">
         {" "}{isLogin ?
                    <Link to="/register">
                        Sign Up
                    </Link>
                    :
                    <Link to="/login">
                        Login
                    </Link>}
       </span>
            </p>
        </form>
    );
};