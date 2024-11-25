import "./Home.scss";
import React from "react";
import {Hero} from "../../components/Hero/Hero.tsx";
import {Benefits} from "../../components/Benefits/Benefits.tsx";
import {About} from "../../components/About/About.tsx";

export const Home : React.FC = () => {
    return (
        <div className="home">
            <Hero/>
            <Benefits/>
            <About/>
        </div>
    );
};