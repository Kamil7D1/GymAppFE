import "./Header.scss";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../Button/Button";
import { Link, useNavigate } from "react-router-dom";
import { NotificationsPanel } from '../Notifications/NotificationsPanel';
import { useSocket } from '../../context/SocketContext';

interface NavItem {
    label: string;
    href: string;
}

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const { socket } = useSocket();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        setIsLoggedIn(!!token);
        setUserId(storedUserId);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setUserId(null);
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

    useEffect(() => {
        if (socket && userId) {
            console.log('Attempting to join room from Header for user:', userId);
            socket.emit('join', userId);

            // Debug info
            socket.on('roomJoined', (roomId: string) => {
                console.log('Successfully joined room:', roomId);
            });

            return () => {
                console.log('Cleanup: leaving room for user:', userId);
                socket?.off('roomJoined');
                socket?.emit('leave', userId);
            };
        }
    }, [socket, userId]);

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
            {isLoggedIn && userId && (
                <div className="header__nav-notifications">
                    <NotificationsPanel/>
                </div>
            )}
            <div className="header__container">
                <div className="header__logo">
                    <img
                        className="header__logo-img"
                        src="/public/logo.svg"
                        alt="Company Logo"
                    />
                </div>
                <nav className="header__nav">
                    {navItems.map(({label, href}) => (
                        <a
                            key={label}
                            className="header__nav-item"
                            href={href}
                        >
                            {label}
                        </a>
                    ))}
                    {isLoggedIn && userId && (
                        <div className="header__nav-notifications">
                            <NotificationsPanel/>
                        </div>
                    )}
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
                    {navItems.map(({label, href}) => (
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
                    {isLoggedIn && userId && (
                        <div className="header__mobile-menu-notifications">
                            <NotificationsPanel />
                        </div>
                    )}
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