import React, { Component } from 'react';
import { Switch, Route, Link } from "react-router-dom";

import logo from './logo.svg';
import './App.css';

import Index from './views/Index/Index';
import Map from './views/Map/Map';

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Index} />
        <Route path="/map" component={Map} />
      </Switch>
    );
  }
}

export default App;
