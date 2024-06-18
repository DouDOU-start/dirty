import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import SideNav from './SideNav';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import SSHInterface from './SSHInterface';
import RocChart from './RocChart';

function App() {
  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <SideNav />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              ROC Analysis
            </Typography>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path='/terminal' element={<SSHInterface />} />
          <Route path="/chart" element={<RocChart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;