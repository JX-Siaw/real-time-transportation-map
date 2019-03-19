import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import logo from './logo.svg';
import './App.css';

import Index from './views/Index/Index';
import Map from './views/Map/Map';

class App extends Component {
  render() {
    return (
      <Router>
        <Route path="/" exact component={Index} />
        <Route path="/map" component={Map} />
      </Router>
    );
  }
}

export default App;
