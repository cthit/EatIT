import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Route } from "react-router";
import App from "./App";

export default () => (
  <Router>
    <Route path="/" component={App} />
  </Router>
);
