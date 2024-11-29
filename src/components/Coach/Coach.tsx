import "./Coach.scss";

export const Coach = () => {
    return (
        <div className="coach">
            <h2 className="coach__header header--secondary">
                Coaches
            </h2>
            <h3 className="coach__header header--tertiary">
                Your personal champions of fitness, strength, and growth
            </h3>
            <div className="coach__content">
                <div className="coach__info">
                    <img className="coach__image" src="/coach1.png" alt="Ryan Mitchell"/>
                    <p className="coach__info__paragraph">
                        Ryan Mitchell
                    </p>
                </div>
                <div className="coach__info">
                    <img className="coach__image" src="/coach2.png" alt="Nathan Carter"/>
                    <p className="coach__info__paragraph">
                        Nathan Carter
                    </p>
                </div>
                <div className="coach__info">
                    <img className="coach__image" src="/coach3.png" alt="Lucas Morgan"/>
                    <p className="coach__info__paragraph">
                        Lucas Morgan
                    </p>
                </div>
            </div>
        </div>
    );
};