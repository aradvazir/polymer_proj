import React, { useState, useEffect } from 'react';
import moment from 'moment-jalaali'; // For Persian dates
import './Form.css';

const baseUrl = "/";

const Form = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    name: '',
    shift: '',
    line: '',
    productionAmount: '',
    productName: '',
    mixCode: '',
    cpe: '',
    wax: '',
    comment: ''
  });

  const [productOptions, setProductOptions] = useState([]); // Use state for product options
  
  // Automatically set date and time on component load
  useEffect(() => {
    async function fetchProduct() {
      const products = await loadProducts();
      setProductOptions(products); // Update state with fetched products
    }
    fetchProduct();
    moment.loadPersian({ dialect: 'persian-modern' }); // Load Persian settings
    const currentDate = moment().format('jYYYY/jMM/jDD'); // Persian date
    const currentTime = moment().format('HH:mm'); // 24-hour time
    setFormData((prevData) => ({
      ...prevData,
      date: currentDate,
      time: currentTime,
    }));
  }, []);

  const loadProducts = async () => {
    const response = await fetch(baseUrl + "products");
    return await response.json(); // Return the fetched products
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // When product name is selected, update corresponding fields
  const handleProductChange = (e) => {
    const selectedProduct = productOptions.find(
      (product) => product.name === e.target.value
    );
    if (selectedProduct) {
      setFormData({
        ...formData,
        productName: selectedProduct.name,
        mixCode: selectedProduct.mixCode,
        cpe: selectedProduct.cpe,
        wax: selectedProduct.wax
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert(`Form Submitted:
    \nDate: ${formData.date}
    \nTime: ${formData.time}
    \nName: ${formData.name}
    \nShift: ${formData.shift}
    \nLine: ${formData.line}
    \nAmount of Production: ${formData.productionAmount}
    \nProduct Name: ${formData.productName} (Auto-filled)
    \nMix Code: ${formData.mixCode} (Auto-filled)
    \nCPE: ${formData.cpe} (Auto-filled)
    \nWax: ${formData.wax} (Auto-filled)
    \nComment: ${formData.comment}`);
    await fetch(baseUrl + "/send", {
      method: "POST",
      body: JSON.stringify({
        date: formData.date,
        time: formData.time,
        workerName: formData.name,
        shift: formData.shift,
        line: formData.line,
        amount: formData.productionAmount,
        prodName: formData.productName,
        mixCode: formData.mixCode,
        comment: formData.comment,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  const renderIngredients = () => {
    if (formData.productName) {
      return (
        <div className="auto-container">
          <div className="input-group auto">
            <label htmlFor="mixCode">کد میکس</label>
            <p id="mixCode">{formData.mixCode}</p>
          </div>

          <div className="input-group auto">
            <label htmlFor="cpe">CPE</label>
            <p id="cpe">{formData.cpe}</p>
          </div>

          <div className="input-group auto">
            <label htmlFor="wax">واکس</label>
            <p id="wax">{formData.wax}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>اطلاعات تولید</h2>

        <div className="input-group date">
          <label htmlFor="date">تاریخ</label>
          <p id="date">{formData.date}</p>
        </div>

        <div className="input-group time">
          <label htmlFor="time">زمان</label>
          <p id="time">{formData.time}</p>
        </div>

        {/* Manually entered fields */}
        <div className="input-group">
          <label htmlFor="name">نام اپراتور</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="shift">شیفت</label>
          <input
            type="text"
            id="shift"
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="line">خط تولید</label>
          <input
            type="text"
            id="line"
            name="line"
            value={formData.line}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="productionAmount">مقدار تولید</label>
          <input
            type="number"
            id="productionAmount"
            name="productionAmount"
            value={formData.productionAmount}
            onChange={handleChange}
            required
          />
        </div>

        {/* Product selection dropdown */}
        <div className="input-group">
          <label htmlFor="productName">نام محصول</label>
          <select
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleProductChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {productOptions.map((product) => (
              <option key={product.name} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        
        {renderIngredients()}
        
        <div className="input-group">
          <label htmlFor="comment">توضیحات</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="توضیحات خود را وارد کنید"
          ></textarea>
        </div>

        <button type="submit" className="submit-btn">ثبت</button>
      </form>
    </div>
  );
};

export default Form;
