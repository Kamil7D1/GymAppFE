import "./Hero.scss";
import React from "react";
import {Button} from "../Button/Button.tsx";
import {Link} from "react-router-dom";

export const Hero : React.FC = () => {
    return (
        <div className="hero overlay">
            <div className="hero__content">
                <h1 className="header--primary">
                    Challenge your limits and
                    achieve your fitness goals
                </h1>
                <p className="paragraph">
                    Push beyond your comfort zone and unlock your true potential, commit to the process and celebrate
                    every small victory along the way.
                </p>
                <Link to="/register">
                    <Button type="button">
                        Create Free Account
                    </Button>
                </Link>
            </div>
        </div>
    );
};