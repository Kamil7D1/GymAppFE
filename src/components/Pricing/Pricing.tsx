import "./Pricing.scss";
import React from "react";
import {PricingCard} from "../PricingCard/PricingCard.tsx";

interface pricingCard {
    title: string;
    amount:string;
    disclaimer:string;
}

const pricingCards : pricingCard[] = [
    {
        title: "One Month",
        amount: "50",
        disclaimer: "Charges every month unless you cancel",
    },
    {
        title: "Six Months",
        amount: "45",
        disclaimer: "Charges every 6 months unless you cancel",
    },
    {
        title: "One Year",
        amount: "40",
        disclaimer: "Charges every year unless you cancel",
    },
];

export const Pricing : React.FC = () => {
    return (
        <div className="pricing">
            <div className="pricing__header">
                <h2 className="pricing__title header--secondary--white">
                    Pricing
                </h2>
                <h3 className="pricing__subtitle header--tertiary--black">
                    Crushing your health and fitness goals starts here...
                </h3>
            </div>
            <div className="pricing__content">
                {pricingCards.map((item: pricingCard) => (
                    <PricingCard
                    key={item.title}
                    title={item.title}
                    amount={item.amount}
                    disclaimer={item.disclaimer}
                    />
                ))}
            </div>
        </div>
    );
};