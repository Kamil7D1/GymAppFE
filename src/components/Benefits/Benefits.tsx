import "./Benefits.scss";
import { BenefitCard } from "../BenefitCard/BenefitCard";
import React from "react";

interface Benefit {
    title: string;
    image: string;
    description: string[];
}

const BENEFITS : Benefit[] = [
    {
        title: "CrossFit Group Classes",
        image: "public/image-article-croosFit.png",
        description: [
            "Only 30 minutes to a stronger you",
        "Warm-up, workout, and motivation included",
            "Fun, friends, and fitness all in one!"
        ],
    },
    {
        title: "Strength Training",
        image: "public/image-article-strengthTraining.png",
        description: [
            "Dedicated zones for powerlifting and strongman training",
            "Olympic lifting platforms with premium weights and bars",
            "Dumbbells from 5lbs to a massive 250lbs"
        ],
    },
    {
        title: "Personal Training",
        image: "public/image-article-personalTraining.png",
        description: [
            "Weight loss transformation",
            "Competitive CrossFit performance",
            "Powerlifting mastery Let us guide you every step of the way!"
        ],
    },
    {
        title: "Member Only Events",
        image: "public/image-article-memberOnlyEvents.png",
        description: [
            "Friendly fitness competitions",
            "Monthly challenges to keep you motivated",
            "Summer potlucks, games, and good vibes!"
        ],
    }
]

export const Benefits : React.FC = () => {
    return (
        <div className="benefits">
            <div className="benefits__container">
                <h2 className="header--secondary">
                    Benefits
                </h2>
                <h3 className="header--tertiary">
                    We have options for everyone
                </h3>
                <ul className="benefits__grid">
                    {BENEFITS.map((benefit: Benefit) => (
                        <BenefitCard
                            key={benefit.title}
                            benefit={benefit}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};
