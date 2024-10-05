import React from "react";
import Form from "./Form";
import DataTable from "./DataTable";
import Login from "./Login";
import Menu from "./Menu";
import "./App.css";
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/#/menu" element={<Menu />} />
        <Route path="/#/mixentry" element={<Form />} />
        <Route path="/#/datatable" element={<DataTable />} />
      </Routes>
    </Router>
  );
}

export default App;