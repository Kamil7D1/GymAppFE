import "./Header.scss";
import React, { useState, useEffect, useRef } from 'react';
import {Button} from "../Button/Button.tsx";
import {Link, useNavigate} from "react-router-dom";

interface NavItem {
    label: string;
    href: string;
}

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const toggleButton = document.querySelector('.header__menu-toggle-button');
            if (toggleButton && toggleButton.contains(event.target as Node)) {
                return;
            }

            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const navItems: NavItem[] = [
        { label: 'Benefits', href: '#benefits' },
        { label: 'Membership', href: '#membership' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
    ];

    const handleMobileMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__logo">
                    <img
                        className="header__logo-img"
                        src="/public/logo.svg"
                        alt="Company Logo"
                    />
                </div>
                <nav className="header__nav">
                    {navItems.map(({ label, href }) => (
                        <a
                            key={label}
                            className="header__nav-item"
                            href={href}
                        >
                            {label}
                        </a>
                    ))}
                    {isLoggedIn ? (
                        <Button
                            className="header__mobile-menu__button"
                            type="button"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button
                                className="header__mobile-menu__button"
                                type="button"
                            >
                                Log In
                            </Button>
                        </Link>
                    )}
                </nav>
                <div className="header__menu-toggler">
                    <button
                        type="button"
                        className="header__menu-toggle-button"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMobileMenuClick();
                        }}
                    >
                        {isMenuOpen ? (
                            <img
                                className="header__menu-toggle-icon"
                                src="/public/icon-cross.svg"
                                alt="cross"
                            />
                        ) : (
                            <img
                                className="header__menu-toggle-icon"
                                src="/public/icon-menu_hamburger.svg"
                                alt="menu"
                            />
                        )}
                    </button>
                </div>
            </div>
            <div
                ref={menuRef}
                className={`header__mobile-menu ${isMenuOpen ? 'header__mobile-menu--open' : ''}`}
            >
                <div className="header__mobile-menu-container">
                    {navItems.map(({ label, href }) => (
                        <a
                            key={label}
                            className="header__mobile-menu-item"
                            href={href}
                        >
                            <p className="header__mobile-menu-item__paragraph">
                                {label}
                            </p>
                        </a>
                    ))}
                    {isLoggedIn ? (
                        <Button
                            className="header__mobile-menu__button"
                            type="button"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button
                                className="header__mobile-menu__button"
                                type="button"
                            >
                                Log In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};