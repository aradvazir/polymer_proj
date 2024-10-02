import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // For Bootstrap styles
import { Table, Button, Form, Container, Modal, Toast } from "react-bootstrap";
import { AiOutlinePlus } from "react-icons/ai";
import * as XLSX from "xlsx"; // Import XLSX
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./DataTable.css";
import nazaninFont from './fonts/tnrNaz.ttf';

const baseUrl = "/";
// const baseUrl = "http://localhost:8000/";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [editMode, setEditMode] = useState(null); // Track which row is in edit mode
  const [showForm, setShowForm] = useState(false); // Track whether to show the add item form
  const [showModal, setShowModal] = useState(false); // For confirmation modal
  const [itemToDelete, setItemToDelete] = useState(null); // Store item to delete
  const [showToast, setShowToast] = useState(false); // For error toast
  const [tempItem, setTempItem] = useState({}); // Temporary item for edit
  const [columns, setCols] = useState([]);
  const [table, setTable] = useState("");
  const [tables, setTables] = useState([]);
  const [showRightButtons, setShowRightButtons] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      const tables = await (await fetch(baseUrl + "tables")).json();
      setTables(tables);
    };
    fetchData();
  }, []);
  const fetchCols = async (table_name) => {
    let cols = [];
    try {
      cols = await (await fetch(baseUrl + "table/" + table_name)).json();
      setCols(cols);
      const dictionary = cols.reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      setNewItem(dictionary);
    } catch (err) {
      setCols([]);
    }
  };
  const fetchData = async (
    table_name,
    start,
    end,
    order = "id",
    is_asc = "True"
  ) => {
    const url =
      baseUrl +
      "values/" +
      table_name +
      "/" +
      start +
      "/" +
      end +
      "/" +
      order +
      "/" +
      is_asc;
    const the_data = await (await fetch(url)).json();
    setData(the_data);
  };

  const handleAdd = () => {
    console.log("Item 2 add: ");
    console.log(newItem);
    setData([...data, { ...newItem }]);
    const dictionary = columns.reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
    setNewItem(dictionary);
    setShowForm(false); // Hide the form after adding
  };

  const handleDelete = () => {
    if (itemToDelete) {
      console.log("Deleted Item: ");
      console.log(itemToDelete);
      setData(data.filter((item) => item.id !== itemToDelete));
      setShowModal(false); // Close modal after deletion
    }
  };

  const openModal = (id) => {
    setItemToDelete(id); // Set the item to delete
    setShowModal(true); // Show the confirmation modal
  };

  const handleEdit = (id, key, value) => {
    setTempItem({ ...tempItem, [key]: value }); // Set temp item for editing
  };

  const handleTableChange = async (e) => {
    setTable(e.target.value);
    await fetchCols(e.target.value);
    await fetchData(e.target.value, 0, 1000);
  };

  const toggleEditMode = (id) => {
    if (editMode === id) {
      // If already in edit mode, save changes
      console.log("The edited: ");
      console.log(tempItem)
      setData(
        data.map((item) => (item.id === id ? { ...item, ...tempItem } : item))
      );
      setEditMode(null);
    } else {
      // Set edit mode for the row
      setEditMode(id);
      const itemToEdit = data.find((item) => item.id === id);
      setTempItem({ ...itemToEdit }); // Populate temp item
    }

  };

  const cancelEdit = () => {
    setEditMode(null); // Exit edit mode without saving
  };

  const handleExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data); // Convert data to worksheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data"); // Append the worksheet
    XLSX.writeFile(workbook, "data.xlsx"); // Save the file
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    // Fetch the font file
    fetch(nazaninFont)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
        })
        .then(fontData => {
            const fontArray = new Uint8Array(fontData);
            const fontBase64 = btoa(String.fromCharCode(...fontArray));

            // Add the Farsi font to the jsPDF instance
            doc.addFileToVFS("Nazanin.ttf", fontBase64);
            doc.addFont("Nazanin.ttf", "Nazanin", "normal");
            doc.setFont("Nazanin"); // Set the initial font for Farsi

            // Define columns and data for autoTable
            const columnsConfig = columns.map(col => ({
                header: col, // Column headers
                dataKey: col // Data key for mapping
            }));

            const rows = data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col] = item[col]; // Map data
                });
                return row;
            });

            // Create the PDF table
            doc.autoTable({
                columns: columnsConfig,
                body: rows,
                styles: {
                    fontSize: 60 / columns.length,
                    font: "Nazanin", // Default font for the table (if not overridden per row)
                },
                margin: { top: 10 },
            });

            doc.save("table_data.pdf");
        })
        .catch(error => {
            console.error("Error loading font or generating PDF:", error);
        });
  };

  

  return (
    <Container className="p-4">
      <div className="parent-container">
        <div className="input-group-special">
          <label htmlFor="table_id">نام جدول</label>
          <select
            id="table_id"
            name="table_id"
            value={table}
            onChange={handleTableChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="button-container">
        {/* Top-right buttons */}
        {showRightButtons && (
          <div className="right-buttons">
            <Button className="ExcelPdf-button" onClick={() => {
              console.log("Excel button clicked")
              handleExcel();
            }}>
              Excel
            </Button>
            <Button className="ExcelPdf-button" onClick={() => {
              console.log("PDF button clicked")
              handlePDF();
            }}>
              PDF
            </Button>
          </div>
        )}
      </div>

      <div className="button-container">
        {/* Centered plus button */}
        <div className="center-button">
          <Button
            className={`custom-button ${showForm ? "cancel-button" : "plus-button"}`}
            onClick={() => {
              setShowForm(!showForm);
              setShowRightButtons(!showRightButtons); // Toggle visibility of right buttons
            }}
          >
            {showForm ? "انصراف" : <AiOutlinePlus size={30} />}
          </Button>
        </div>
      </div>

      {showForm && (
        <Form className="mb-4">
          {columns.length && columns.filter(item => item !== "id").map(
            (col) =>
              (
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder={col}
                    name={col}
                    value={newItem[col] || ''} // Provide a fallback to avoid uncontrolled input
                    onChange={(e) => {
                      setNewItem({
                        ...newItem,
                        [e.target.name]: e.target.value,
                      });
                    }}
                  />
                </Form.Group>
              )
          )}
            
          <div className="d-flex justify-content-center">
            <Button className="Add-button" variant="success" onClick={() => {
              handleAdd(); // Your existing logic for adding
              setShowRightButtons(true); // Show the right buttons again
            }}>
              افزودن مورد
            </Button>
          </div>
        </Form>
      )}

      <Table striped bordered hover className="custom-table">
        <thead>
          <tr>
            {columns.filter(item => item !== "id").map((col, index) => (
              <th key={index}>{col}</th>
            ))}
            <th>ویرایش</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {Object.keys(item).filter(item => item !== "id").map((key, index) => (
                <td key={index} name={item.id}>
                  {editMode === item.id ? (
                    <Form.Control
                      type="text"
                      value={tempItem[key]}
                      onChange={(e) => handleEdit(item.id, key, e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span>{item[key]}</span>
                  )}
                </td>
              ))}
              <td>
                {editMode === item.id ? (
                  <div className="button-group">
                    <Button
                      variant="success"
                      onClick={() => toggleEditMode(item.id)}
                      className="save-button"
                    >
                      ذخیره
                    </Button>
                    <Button variant="secondary" onClick={cancelEdit}>
                      انصراف
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="warning"
                    onClick={() => toggleEditMode(item.id)}
                  >
                    ویرایش
                  </Button>
                )}
              </td>
              <td>
                <Button variant="danger" onClick={() => openModal(item.id)}>
                  حذف
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تأیید حذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            انصراف
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            حذف
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification for Error Message */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        <Toast.Body>لطفاً هر دو فیلد را قبل از افزودن مورد پر کنید.</Toast.Body>
      </Toast>
    </Container>
  );
};

export default DataTable;
