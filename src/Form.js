import React, { useState, useEffect } from 'react';
import moment from 'moment-jalaali'; // For Persian dates
import './Form.css';

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

  const productOptions = [
    { name: 'Product A', mixCode: 'MX100', cpe: '10%', wax: '5%' },
    { name: 'Product B', mixCode: 'MX200', cpe: '15%', wax: '6%' },
    { name: 'Product C', mixCode: 'MX300', cpe: '12%', wax: '7%' },
  ];

  // Automatically set date and time on component load
  useEffect(() => {
    moment.loadPersian({ dialect: 'persian-modern' }); // Load Persian settings
    const currentDate = moment().format('jYYYY/jMM/jDD'); // Persian date
    const currentTime = moment().format('HH:mm'); // 24-hour time
    setFormData((prevData) => ({
      ...prevData,
      date: currentDate,
      time: currentTime,
    }));
  }, []);

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
    setFormData({
      ...formData,
      productName: selectedProduct.name,
      mixCode: selectedProduct.mixCode,
      cpe: selectedProduct.cpe,
      wax: selectedProduct.wax
    });
  };

  const handleSubmit = (e) => {
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
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>اطلاعات تولید</h2>

        <div className="input-group">
          <label htmlFor="date">تاریخ</label>
          <input
            type="text"
            id="date"
            name="date"
            value={formData.date}
            readOnly
          />
        </div>

        <div className="input-group">
          <label htmlFor="time">زمان</label>
          <input
            type="text"
            id="time"
            name="time"
            value={formData.time}
            readOnly
          />
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

        <div className="input-group">
          <label htmlFor="mixCode">کد میکس</label>
          <input
            type="text"
            id="mixCode"
            name="mixCode"
            value={formData.mixCode}
            readOnly
            placeholder="(پر کردن اتوماتیک)"
          />
        </div>

        <div className="input-group">
          <label htmlFor="cpe">CPE</label>
          <input
            type="text"
            id="cpe"
            name="cpe"
            value={formData.cpe}
            readOnly
            placeholder="(پر کردن اتوماتیک)"
          />
        </div>

        <div className="input-group">
          <label htmlFor="wax">واکس</label>
          <input
            type="text"
            id="wax"
            name="wax"
            value={formData.wax}
            readOnly
            placeholder="(پر کردن اتوماتیک)"
          />
        </div>

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
