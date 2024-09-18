import React, { useState, useEffect } from "react";
import moment from "moment-jalaali"; // For Persian dates
import "./Form.css";

const baseUrl = "/";

const Form = () => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    operator: "",
    shift: "",
    line_id: "",
    productionAmount: "",
    product_id: "",
    recipe_code: "",
    description: "",
    fitting: "",
  });

  const [productOptions, setProductOptions] = useState({}); // Use state for product options
  const [mixOptions, setMixOptions] = useState({}); // Use state for mix options
  const [operatorOptions, setOperatorOptions] = useState({}); // Use state for mix options
  const [lineOptions, setLineOptions] = useState({}); // Use state for mix options
  const [ingredients, setIngredients] = useState();
  // Automatically set date and time on component load
  useEffect(() => {
    async function fetchProduct() {
      const products = await loadProducts();
      setProductOptions(products); // Update state with fetched products
    }
    fetchProduct();
    async function fetchMix() {
      const mix = await loadMix();
      setMixOptions(mix); // Update state with fetched products
    }
    fetchMix();
    async function fetchOperator() {
      const mix = await loadOperator();
      setMixOptions(mix); // Update state with fetched products
    }
    fetchOperator();
    async function fetchLine() {
      const mix = await loadLine();
      setMixOptions(mix); // Update state with fetched products
    }
    fetchLine();
    moment.loadPersian({ dialect: "persian-modern" }); // Load Persian settings
    const currentDate = moment().format("jYYYY/jMM/jDD"); // Persian date
    const currentTime = moment().format("HH:mm"); // 24-hour time
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
  const loadMix = async () => {
    const response = await fetch(baseUrl + "mixes");
    return await response.json(); // Return the fetched products
  };
  const loadOperator = async () => {
    const response = await fetch(baseUrl + "Operator");
    return await response.json(); // Return the fetched products
  };
  const loadLine = async () => {
    const response = await fetch(baseUrl + "Line");
    return await response.json(); // Return the fetched products
  };

  const handleChange = async (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "mixName") {
      const ingred = await renderIngredients(e.target.value);
      setIngredients(ingred);
    }
    console.log("mix: " + e.target.name + " : " + e.target.value);
  };

  // When product name is selected, update corresponding fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    alert(`Form Submitted:
    ${JSON.stringify(formData, null, 4)}`);
    // await fetch(baseUrl + "/send", {
    //   method: "POST",
    //   body: JSON.stringify(formData),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // });
  };

  const renderIngredients = async (mixName) => {
    let ans = (
      <div className="input-group auto">هیچ میکسی انتخاب نشده است.</div>
    );
    if (mixName) {
      let mix_ingreds = null;
      try {
        mix_ingreds = await (await fetch(baseUrl + "mix/" + mixName)).json();
      } catch (err) {
        return ans;
      }
      setFormData((prevData) => ({
        ...prevData,
        ...mix_ingreds,
      }));
      return (
        <div className="auto-container">
          {Object.keys(mix_ingreds).map((key) => (
            <div className="input-group auto">
              <label>{key}</label>
              <input
                type="text"
                name={key}
                value={mix_ingreds[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
        </div>
      );
    } else {
      return ans;
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

        {/* Operator selection dropdown */}
        <div className="input-group">
          <label htmlFor="name">نام اپراتور</label>
          <select
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {Object.keys(operatorOptions).map((operatorId) => (
              <option key={operatorId} value={operatorId}>
                {operatorOptions[operatorId]}
              </option>
            ))}
          </select>
        </div>

        {/* Shift selection dropdown */}
        <div className="input-group">
          <label htmlFor="shift">شیفت</label>
          <select
            id="shift"
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            <option value="morning">صبح</option>
            <option value="afternoon">ظهر</option>
            <option value="night">شب</option>
          </select>
        </div>
        
        {/* Line selection dropdown */}
        <div className="input-group">
          <label htmlFor="line">خط تولید</label>
          <select
            id="line"
            name="line"
            value={formData.line}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {Object.keys(lineOptions).map((lineId) => (
              <option key={lineId} value={lineId}>
                {lineOptions[lineId]}
              </option>
            ))}
          </select>
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
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {Object.keys(productOptions).map((productId) => (
              <option key={productId} value={productId}>
                {productOptions[productId]}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="mixName">نام میکس</label>
          <select
            id="mixName"
            name="mixName"
            value={formData.mixName}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {Object.keys(mixOptions).map((mixId) => (
              <option key={mixId} value={mixId}>
                {mixOptions[mixId]}
              </option>
            ))}
          </select>
        </div>

        {ingredients}

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

        <button type="submit" className="submit-btn">
          ثبت
        </button>
      </form>
    </div>
  );
};

export default Form;
