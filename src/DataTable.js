import React, { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // For Bootstrap styles
import { Table, Button, Form, Container, Modal, Toast } from "react-bootstrap";
import { AiOutlinePlus } from "react-icons/ai";
import * as XLSX from "xlsx"; // Import XLSX
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./DataTable.css";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import nazaninFont from './fonts/tnrNaz.ttf';
import { baseUrl, getCookie, setCookie } from "./consts";

const role = getCookie("role");
const delete_permission = (role === "admin") || (role === "manager");
const edit_permission =   (role === "admin") || (role === "manager") || (role === "editor");

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
  const [table, setTable] = useState(getCookie("table")?getCookie("table") : "");
  const [tables, setTables] = useState([]);
  const [showRightButtons, setShowRightButtons] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [searchInputVisible, setSearchInputVisible] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      const tables = await (await fetch(baseUrl + "tables")).json();
      setTables(tables);
      setFilteredData(data);
      
    };
    fetchData();
  }, [data]);
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
    try{
      const the_data = await (await fetch(url)).json();
      console.log(the_data);
      setData(the_data);
    }catch(err){
      setData([]);
    }
    
  };

  const translations = {
    allproducts: "همه محصولات",
    fittingproduct: "اتصالات",
    machines: "دستگاه‌ها",
    materials: "محصولات",
    operators: "اپراتور‌ها",
    pipeproduct: "لوله‌ها",
    rawmaterials: "مواد اولیه",
    recipes: "دستور تولید",
    mixentries: "اطلاعات میکسر",
    // Add more translations as needed
  };

  const handleAdd = async() => {
    console.log("Item 2 add: ");
    delete newItem.id;
    delete newItem.hashed_pass;
    console.log(newItem);
    if(baseUrl !== "/"){
      if(table !== "users"){
        await fetch(baseUrl + "table/" + table, {
          method: "POST",
          body: JSON.stringify(newItem)
        })
      }else{
        let form = new FormData();
        form.append("username", newItem.username);
        form.append("hashed_pass", newItem.password);
        form.append("role", newItem.role);
        let newnewItem = {
          username: newItem.username,
          hashed_pass: newItem.password,
          role: newItem.role,
        }
        console.log(newnewItem);
        const token = getCookie("token");
        const signup_resp = await fetch(baseUrl + "signup/", {
          method: "POST",
          
          body: JSON.stringify(newnewItem),
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(signup_resp);
        console.log(await signup_resp.json())
      }
      
      window.location.reload();
    }else {
      setData([...data, { ...newItem }]);
      const dictionary = columns.reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      setNewItem(dictionary);
      setShowForm(false); // Hide the form after adding
    }
    
  };

  const handleDelete = async() => {
    if (itemToDelete) {
      console.log("Deleted Item: ");
      console.log(itemToDelete);
      if(baseUrl !== "/"){
        await fetch(baseUrl + "table/" + table + "/" + itemToDelete, {
          method: "DELETE",
        })
      }else{
        setData(data.filter((item) => item.id !== itemToDelete));
        setShowModal(false); // Close modal after deletion
      }
      
    }
  };

  const openModal = (id) => {
    setItemToDelete(id); // Set the item to delete
    setShowModal(true); // Show the confirmation modal
  };

  const handleEdit = (id, key, value) => {
    setTempItem({ ...tempItem, [key]: value }); // Set temp item for editing
  };

  const handleColumnSearch = (column, value) => {
    setColumnFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [column]: value };
      
      // Apply filtering for all active filters across all columns
      const filtered = data.filter((item) => {
        return Object.keys(updatedFilters).every((key) => {
          const filterValue = updatedFilters[key].toLowerCase();
          return item[key] 
            ? item[key].toString().toLowerCase().includes(filterValue)
            : false;
        });
      });
  
      // Update filteredData and column filters
      setFilteredData(filtered);
      return updatedFilters;
    });
  };

  const toggleSearchInput = (column) => {
    setSearchInputVisible((prev) => ({ ...prev, [column]: !prev[column] }));
    // Optionally reset the input when opened
    if (!searchInputVisible[column]) {
      setColumnFilters((prev) => ({ ...prev, [column]: "" }));
    }
  };

  const resetFilters = () => {
    setColumnFilters({});
    setFilteredData(data);  // Reset filtered data to the original data
  
    // Close all search boxes
    setSearchInputVisible({});
  };

  const handleTableChange = useCallback(async(e, table_name=null) => {
    if(e){
      table_name = e.target.value;
    }else{
      console.log("Table: " + table_name)
    }
    setTable(table_name);
    setCookie("table", table_name);
    await fetchCols(table_name);
    await fetchData(table_name, 0, 1000);
  }, [/* dependencies */]);
  useEffect(() => {
    handleTableChange(null, table);
  }, [handleTableChange, table]);
  const toggleEditMode = async(id) => {
    if (editMode === id) {
      // If already in edit mode, save changes
      console.log("The edited: ");
      console.log(tempItem)
      if(baseUrl !== "/"){
        await fetch(baseUrl + "table/" + table + "/" + editMode, {
          method: "PUT",
          body: JSON.stringify(tempItem)
        })
      }  
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
    <Container className="datatable">
      {/* {table !== "users" && */}{
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
            {tables.map((t) => (
              <option key={t} value={t}>
                {translations[t] || t} {/* Use the translation, fallback to original if not found */}
              </option>
            ))}
          </select>
        </div>
      </div>}

      <div className="button-container">
        {/* Top-right buttons */}
        {showRightButtons && (
          <div className="right-buttons">
            <Button className="Excel-button" onClick={() => {
              console.log("Excel button clicked")
              handleExcel();
            }}>
              <FaFileExcel size={20} />
            </Button>
            <Button className="Pdf-button" onClick={() => {
              console.log("PDF button clicked")
              handlePDF();
            }}>
              <FaFilePdf size={20} />
            </Button>
          </div>
        )}
      </div>

      <div className="button-container">
        {/* Centered plus button */}
        {!showForm && <div className="center-button">
          <Button
            className={`custom-button ${showForm ? "cancel-button" : "plus-button"}`}
            onClick={() => {
              setShowForm(!showForm);
              setShowRightButtons(!showRightButtons); // Toggle visibility of right buttons
            }}
          >
            <AiOutlinePlus size={30} />
          </Button>
        </div>}
      </div>

      {showForm && (
        <Form className="mb-4">
          <Table striped bordered hover className="custom-table form-table">
            <thead>
              <tr>
                {columns.filter(item => !("id" in item)).map(dict => {
                  const col = Object.keys(dict).pop();
                  return col !== "hashed_pass" ? (
                    <th>col</th>
                  ) : (
                    <th>Password</th>
                  );
                }
              )}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columns.length && columns.filter(item => !("id" in item)).map(
                  (dict) => {
                    const col = Object.keys(dict).pop();
                    return col !== "hashed_pass" ? (
                      <td>
                        <Form.Control
                          type="text"
                          placeholder={col}
                          name={col}
                          value={newItem[col]} // Provide a fallback to avoid uncontrolled input
                          onChange={(e) => {
                            setNewItem({
                              ...newItem,
                              [e.target.name]: e.target.value,
                            });
                          }}
                        />
                      </td>
                    ) : 
                    (
                      <td>
                        <Form.Control
                          type="text"
                          placeholder="Password"
                          name="password"
                          value={newItem["password"]} // Provide a fallback to avoid uncontrolled input
                          onChange={(e) => {
                            setNewItem({
                              ...newItem,
                              [e.target.name]: e.target.value,
                            });
                          }}
                        />
                      </td>
                    )
                  }
                    
                )}
              </tr>
            </tbody>
          </Table>
            
          <div className="d-flex justify-content-center">
            <Button className="Add-button" variant="success" onClick={async() => {
              await handleAdd();
              setShowRightButtons(true);
            }}>
              افزودن
            </Button>
            <Button
              className={`custom-button ${showForm ? "cancel-button" : "plus-button"}`}
              onClick={() => {
                setShowForm(!showForm);
                setShowRightButtons(!showRightButtons); // Toggle visibility of right buttons
              }}
            >
              انصراف
            </Button>
          </div>
        </Form>
      )}

      <div className="reset-button-container">
        <button onClick={resetFilters} className="reset-button">حذف فیلتر‌ها</button>
      </div>

      <Table striped bordered hover className="custom-table">
      <thead>
          <tr>
            {columns.filter(item => !("id" in item) && !("hashed_pass" in item)).map(dict => {
              const col = Object.keys(dict).pop();
              return (
                <th key={col} style={{ cursor: "pointer" }} onClick={() => toggleSearchInput(col)}>
                  {col}
                </th>
              );
            })}
            {edit_permission && <th>ویرایش</th>}
            {delete_permission && <th>حذف</th>}
          </tr>
          <tr>
            {columns.filter(item => !("id" in item) && !("hashed_pass" in item)).map(dict => {
              const col = Object.keys(dict).pop();
              return (
                <th key={`input-${col}`}>
                  {searchInputVisible[col] && (
                    <input
                    type="text"
                    style={{
                      textAlign: 'center', // Horizontally center the text
                      height: '30px',      // Fixed height
                      lineHeight: '30px',   // Set line-height equal to height for vertical centering
                      width: '100%',       // Make input box fill the column width
                      fontSize: '14px',    // Adjust the font size as needed
                      padding: '1px',          // Remove default padding
                      borderRadius: '10px',
                      boxSizing: 'border-box', // Ensure padding and border are included in the element's width and height
                    }}
                    placeholder={`Search ${col}`}
                    value={columnFilters[col] || ""}
                    onChange={(e) => handleColumnSearch(col, e.target.value)}
                    autoFocus
                  />
                  )}
                </th>
              );
            })}
            {edit_permission && <th></th>}
            {delete_permission && <th></th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr>
              {Object.keys(item).filter(key => key !== "id" && key !== "hashed_pass").map(key => (
                <td>
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
              {edit_permission && 
              <td>
                {editMode === item.id ? (
                  <div className="button-group">
                    <Button
                      variant="success"
                      onClick={async() => await toggleEditMode(item.id)}
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
              }
              {delete_permission && 
              <td>
                <Button variant="danger" onClick={() => openModal(item.id)}>
                  حذف
                </Button>
              </td>
              }
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