import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './Pages/Main';
import Admin from './Pages/Admin';
import './Style/style.scss';
import usePageView from './hooks/usePageView';

function App() {
  usePageView();

  return (
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/admin-0919" element={<Admin />} />
      </Routes>
  );
}

export default App;