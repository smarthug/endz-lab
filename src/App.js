import "./App.css";
import * as Pages from "./page";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React from "react";

const labs = Object.entries(Pages);
// console.log(labs);

function App() {
  return (
    <Router>
      <div style={{ height: "100vh" }} className="App">
        <Routes>
          {labs.map(([k, v]) => {
            if (v.default) {
              const Tmp = v.default;
              return <Route exact key={k} path={`/${k}`} element={<Tmp />} />;
            }
            return null;
          })}
          <Route exact path={`/`} element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

function Home() {
  return (
    <React.Fragment>
      <h1 style={{ marginTop: 0 }}>LAB</h1>
      {labs.map(([k, v]) => {
        if (v.default) {
          return (
            <div key={k}>
              <Link to={`/${k}`}>{k}</Link>
            </div>
          );
        }
        return null;
      })}
    </React.Fragment>
  );
}
