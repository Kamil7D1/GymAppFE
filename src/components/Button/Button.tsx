import "./Button.scss";
import React, {ReactNode, MouseEvent} from "react";

interface ButtonProps {
    children: string | ReactNode;
    className?: string;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    type: "button";
}

export const Button : React.FC<ButtonProps> = ({ children, className, onClick, type }) => {
    return (
        <button
            className={`${className} button`}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
};