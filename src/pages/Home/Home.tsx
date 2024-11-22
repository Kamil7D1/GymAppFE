import "./Home.scss";
import React from "react";
import {Hero} from "../../components/Hero/Hero.tsx";

export const Home : React.FC = () => {
    return (
        <div className="home">
            <Hero/>
        </div>
    );
};