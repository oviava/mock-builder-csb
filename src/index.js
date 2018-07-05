import React from "react";
import ReactDOM from "react-dom";
import { builder, onBuild, fake, sequence, composed } from "./databuilder";

import "./styles.css";

const dataBuilder = builder(
  {
    incr: sequence(x => x),
    name: fake(f => f.internet.url()),
    size: onBuild(() => ({
      height: 15,
      width: 30
    })),
    together: composed(
      ({ incr, name, size }) =>
        `${incr} -- ${name} -- ${size.height} -- ${size.width}`
    ),
    other: 33
  },
  5
);

const data = dataBuilder();

const newData = dataBuilder();

function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <ul>
        <li>{data.incr}</li>
        <li>{data.name}</li>
        <li>{data.size.height}</li>
        <li>{data.size.width}</li>
        <li>{data.together}</li>
        <li>{data.other}</li>
      </ul>
      <ul>
        <li>{newData.incr}</li>
        <li>{newData.name}</li>
        <li>{newData.size.height}</li>
        <li>{newData.size.width}</li>
        <li>{newData.together}</li>
        <li>{data.other}</li>
      </ul>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
