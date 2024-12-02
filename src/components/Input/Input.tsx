import "./Input.scss";
import React from "react";

interface InputProps {
    id: string;
    name: string;
    type: string;
    placeholder: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    value: string;
    className?: string;
}

export const Input : React.FC<InputProps> = ({
    id,
    name,
    type,
    placeholder,
    onChange,
    onBlur,
    value,
    className,
                                 }) => {
    return (
        <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            className={`input ${className}`}
        />
    );
};