import "./About.scss";
import React from "react";

export const About : React.FC = () => {
    return (
        <div className="about">
            <div className="about__content">
                <h2 className="header--secondary">
                    About Us
                </h2>
                <h3 className="header--tertiary">
                    We’re your local fitness community, focused on helping you reach your health and wellness goals.
                </h3>
                <p className="paragraph--gray">
                    Whether you're looking to build strength, increase endurance, or simply improve your overall
                    fitness, our team is here to guide and support you.
                </p>
            </div>
        </div>
    );
};