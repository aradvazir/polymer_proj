import React, { useEffect, useState } from "react";
import { baseUrl } from "./consts";
import "./oneRowModal.css";
import { translation_cols, translations } from "./consts";
import { Table } from "react-bootstrap";

const OneRowModal = ({ tableName, id }) => {
    const [row, setRow] = useState(null);
    const [columns, setColumns] = useState(null);
    const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading when fetching data
            console.log(`Fetching data for ${id} in table ${tableName}`);
            try {
                let result;
                if(tableName !== "allproducts")
                {
                    result = await fetch(`${baseUrl}table/${tableName}/${id}/`);
                }
                else
                {
                    result = await fetch(`${baseUrl}product/${id}/`);
                }
                const newRow = await result.json();
                setRow(newRow);
                setColumns(Object.keys(newRow));
                console.log(newRow);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false); // End loading once data is fetched
            }
        };
        fetchData();
    }, [tableName, id]);

    if (loading) {
        return <div>Loading...</div>; // Loading indicator
    }

    if (!row || !columns) {
        return <div>No data found.</div>; // Fallback if no row or columns data
    }

    return (
        <div className="oneRow">
            <h2>
                <p>{translations[tableName]}</p> {/* This can be dynamic if needed */}
            </h2>
            <Table striped bordered hover className="custom-table">
                <thead>
                    <tr>
                        {columns.filter((value) => value !== "id").map((column) => (
                            <th key={column}>{translation_cols[column]}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {Object.entries(row).filter((key, value) => value >= 1).map(([key, value]) => (
                            <td key={key}>
                                {['marriage', 'export', 'active', 'confirm'].includes(key) ? (
                                    <span style={{
                                        color: value ? '#1e2' : '#e12'
                                    }}>
                                        {value ? '✓' : '✗'}
                                    </span>
                                ) : typeof value === "boolean" ? (
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={value} disabled />
                                        <span className="slider"></span>
                                    </label>
                                ) : value === "" ? (
                                    <dive>-</dive>
                                ) : (
                                    <div>{value}</div>
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </Table>
        </div>
    );
};

export default OneRowModal;
