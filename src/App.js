// import React
import React, { Component } from 'react';
// import style and images
import logo from './logo.svg';
import './App.css';
//import components
import Map from './components/Map';
import Filter from './components/Filter';


class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Lets GO! - Neighborhood Map</h1>
        </header>
        <Filter />
        <Map / >
      </div>
    );
  }
}

export default App;