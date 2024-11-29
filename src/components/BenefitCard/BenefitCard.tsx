import "./BenefitCard.scss";
import React from "react";

interface Benefit {
    title: string;
    image: string;
    description: string[];
}

interface BenefitCardProps {
    benefit: Benefit;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit }) => {
    return (
        <li className="benefit-card">
            <img className="benefit-card__image" src={benefit.image} alt="image"/>
            <div className="benefit-card__content">
                <h3 className="benefit-card__header header--tertiary">
                    {benefit.title}
                </h3>
                <ul className="benefit-card__list">
                    {benefit.description.map((item: string) => (
                        <li key={item} className="benefit-card__list-item">
                            <img src="/public/icon-check_mark.png" alt="check mark"/>
                            <p className="paragraph">
                                {item}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );
};