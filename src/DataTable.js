import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // For Bootstrap styles
import { Table, Button, Form, Container, Modal, Toast } from "react-bootstrap";
import { AiOutlinePlus } from "react-icons/ai";
import "./DataTable.css";

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

  useEffect(() => {
    const fetchData = async () => {
      const tables = await (await fetch(baseUrl + "tables")).json();
      setTables(tables);
    };
    fetchData();
  });
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

  const handleAction1 = () => {
    // Action for the first button
  };
  
  const handleAction2 = () => {
    // Action for the second button
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
        <div className="left-buttons">
          <Button className="custom-button new-button" variant="primary" onClick={handleAction1}>
            دکمه اول
          </Button>
          <Button className="custom-button new-button" variant="secondary" onClick={handleAction2}>
            دکمه دوم
          </Button>
        </div>
        <div className="center-button">
          <Button
            className={`custom-button ${showForm ? "cancel-button" : "plus-button"}`}
            onClick={() => setShowForm(!showForm)}
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
                    value={newItem[col]}
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
            <Button className="Add-button" variant="success" onClick={handleAdd}>
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
