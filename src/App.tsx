import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

import MainHeader from "./components/MainHeader";
import MainPage from './pages/MainPage';
// import EditMap from './pages/EditMap.jsx';

import './App.css';

function App() {

  return (
    <BrowserRouter>

      <MainHeader />

      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />
          {/* <Route path="/edit" element={<EditMap />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </BrowserRouter>
  )
}

export default App
