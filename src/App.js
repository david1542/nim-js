import React from 'react';
import './App.css';
import Game from "./Game";

function App() {
  return (
    <div className="App">
      <h1 className="display-4">Try to beat me on Nim!</h1>
      <Game />
    </div>
  );
}

export default App;
