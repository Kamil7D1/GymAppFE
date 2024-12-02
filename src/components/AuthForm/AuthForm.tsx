import "./AuthForm.scss";
import React from "react";
import * as Yup from "yup";
import {Button} from "../Button/Button.tsx";
import {useFormik} from "formik";
import {Input} from "../Input/Input.tsx";

export const AuthForm: React.FC = () => {
    const formik = useFormik<{
        email: string;
        password: string;
    }>({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid is required")
                .required("Email is required"),
            password: Yup.string()
                .required("Password is required")
                .min(8, "Password must be at least 8 characters")
                .matches(/[a-zA-Z]/, "Password must contain letters")
        }),
        onSubmit: (values) => {
            console.log(values);
        },
    });
    return (
        <form className="auth-form" onSubmit={formik.handleSubmit}>
            <h1 className="auth-form__title header--primary">
                Login
            </h1>
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
                ): null}
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
                ): null}
            </div>
            <p className="auth-form__forgot-password paragraph">
               <span className="auth-form__forgot-password-link">
                   Forgot Password?
               </span>
            </p>
            <Button className="auth-form__submit-button" type="submit">
                LOGIN
            </Button>
            <p className="auth-form__signup-text paragraph">
                Don't have an account?
                <span className="auth-form__signup-link">
                    {" "}Sign Up
               </span>
            </p>
        </form>
    );
};