import './App.scss';
import * as React from "react";
import {MainLayout} from "./MainLayout/MainLayout.tsx";
import {Home} from "./pages/Home/Home.tsx";

export const App : React.FC = () => {

  return (
    <MainLayout>
      <Home/>
    </MainLayout>
  );
};
