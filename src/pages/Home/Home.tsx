import "./Home.scss";
import React from "react";
import {Hero} from "../../components/Hero/Hero.tsx";
import {Benefit} from "../../components/Benefit/Benefit.tsx";
import {Coach} from "../../components/Coach/Coach.tsx";
import {Pricing} from "../../components/Pricing/Pricing.tsx";
import {About} from "../../components/About/About.tsx";

export const Home : React.FC = () => {
    return (
        <div className="home">
            <Hero/>
            <Benefit/>
            <Coach/>
            <Pricing/>
            <About/>
        </div>
    );
};