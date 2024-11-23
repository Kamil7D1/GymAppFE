import "./Hero.scss";
import React from "react";
import {Button} from "../Button/Button.tsx";

export const Hero : React.FC = () => {
    return (
        <section className="hero overlay">
            <div className="hero__content">
                <h1 className="header--primary">
                    Challenge your limits and
                    achieve your fitness goals
                </h1>
                <p className="paragraph">
                    Push beyond your comfort zone and unlock your true potential, commit to the process and celebrate
                    every small victory along the way.
                </p>
                <Button type="button">
                    Create Free Account
                </Button>
            </div>
        </section>
    );
};