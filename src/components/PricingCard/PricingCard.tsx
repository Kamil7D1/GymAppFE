import "./PricingCard.scss"
import {Button} from "../Button/Button.tsx";
import React from "react";

interface pricingCard {
    title: string;
    amount:string;
    disclaimer:string;
}

export const PricingCard : React.FC<pricingCard> = ({title, amount, disclaimer}) => {
    return (
        <div className="pricing-card">
            <h3 className="pricing-card__title">
                {title}
            </h3>
            <p className="pricing-card__price">
                <span className="pricing-card__price-amount">${amount}</span>
                <span className="pricing-card__price-period">/month</span>
            </p>
            <ul className="pricing-card__list">
                <li className="pricing-card__list-item">
                    <img
                        className="pricing-card__list-icon"
                        src="/icon-check_mark.png"
                        alt="check mark"
                    />
                    <p className="pricing-card__list-text">
                        All Classes
                    </p>
                </li>
                <li className="pricing-card__list-item">
                    <img
                        className="pricing-card__list-icon"
                        src="/icon-check_mark.png"
                        alt="check mark"
                    />
                    <p className="pricing-card__list-text">
                        Free first personal training
                    </p>
                </li>
                <li className="pricing-card__list-item">
                    <img
                        className="pricing-card__list-icon"
                        src="/icon-check_mark.png"
                        alt="check mark"
                    />
                    <p className="pricing-card__list-text">
                        Gym access
                    </p>
                </li>
            </ul>
            <p className="pricing-card__disclaimer paragraph--gray">
                {disclaimer}
            </p>
            <div className="pricing-card__button-container">
                <Button
                    type="button"
                    className="pricing-card__button"
                >
                    Join Now
                </Button>
            </div>
        </div>
    );
}