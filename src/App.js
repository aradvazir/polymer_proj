import React from "react";
import Form from "./Form";
import DataTable from "./DataTable";
import Login from "./Login";
import Menu from "./Menu";
import ProductManager from './ProductManager';
import ProductOperator from './ProductOperator';
import StopsProduct from './StopsProduct'
import "./App.css";
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/mixentry" element={<Form />} />
        <Route path="/datatable" element={<DataTable />} />
        <Route path="/productmanager" element={<ProductManager />} />
        <Route path="/productoperator" element={<ProductOperator />} />
        <Route path="/stopsproduct" element={<StopsProduct />} />
      </Routes>
    </Router>
  );
}

export default App;