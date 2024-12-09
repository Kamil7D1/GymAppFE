import './App.scss';
import * as React from "react";
import {MainLayout} from "./MainLayout/MainLayout.tsx";
import {Home} from "./pages/Home/Home.tsx";
import axios from "axios";

export const App : React.FC = () => {

    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

  return (
    <MainLayout>
      <Home/>
    </MainLayout>
  );
};
