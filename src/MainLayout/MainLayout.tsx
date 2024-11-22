import "./MainLayout.scss";
import React, { ReactNode } from "react";
import { Header } from "../components/Header/Header.tsx";
import {Footer} from "../components/Footer/Footer.tsx";

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="layout__main">
                {children}
            </main>
            <Footer/>
        </div>
    );
};