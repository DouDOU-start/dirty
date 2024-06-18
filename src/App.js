import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import About from './About';
import SSHInterface from './SSHInterface';
import RocChart from './RocChart';
import NavTabs from './NavTabs';
import './App.css';

function App() {
  useEffect(() => {
    const resizer = document.querySelector('.resizer');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    let isResizing = false;

    const mouseDownHandler = (e) => {
      isResizing = true;
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX - sidebar.getBoundingClientRect().left;
      sidebar.style.width = `${newWidth}px`;
    };

    const mouseUpHandler = () => {
      isResizing = false;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);

    return () => {
      resizer.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <div className="sidebar">
          <NavTabs />
        </div>
        <div className="resizer" />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/terminal" element={<SSHInterface />} />
            <Route path="/chart" element={<RocChart />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;