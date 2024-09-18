import React, { useState, useEffect } from "react";
import moment from "moment-jalaali";
import Calendar from "react-calendar";
// import TimePicker from "react-time-picker";
import "react-calendar/dist/Calendar.css"; // Import calendar styles
import "react-clock/dist/Clock.css"; // Import clock styles
import "./Form.css";

const baseUrl = "/";

const Form = () => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    operator_id: "",
    shift: "",
    line_id: "",
    productionAmount: "",
    product_id: "",
    recipe_code: "",
    description: "",
    fitting: "",
  });

  const [productOptions, setProductOptions] = useState([]); // Use state for product options
  const [mixOptions, setMixOptions] = useState([]); // Use state for mix options
  const [operatorOptions, setOperatorOptions] = useState([]); // Use state for mix options
  const [lineOptions, setLineOptions] = useState([]); // Use state for mix options
  const [ingredients, setIngredients] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the selected 
  const [selectedTime, setSelectedTime] = useState("10:00"); // State for the selected 
  const [hasChanged, setHasChanged] = useState(true); // At first it is on other
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
      setOperatorOptions(mix); // Update state with fetched products
    }
    fetchOperator();
    async function fetchLine() {
      const mix = await loadLine();
      setLineOptions(mix); // Update state with fetched products
    }
    fetchLine();
    moment.loadPersian({ dialect: "persian-modern" }); // Load Persian settings
    const currentDate = moment().format("jYYYY-jMM-jDD"); // Persian date
    const currentTime = moment().format("HH:mm"); // 24-hour time
    setFormData((prevData) => ({
      ...prevData,
      date: currentDate,
      time: currentTime,
    }));
  }, []);

  const loadProducts = async () => {
    const response = await fetch(baseUrl + "product");
    return await response.json(); // Return the fetched products
  };
  const loadMix = async () => {
    const response = await fetch(baseUrl + "materials");
    return await response.json(); // Return the fetched products
  };
  const loadOperator = async () => {
    const response = await fetch(baseUrl + "operator");
    return await response.json(); // Return the fetched products
  };
  const loadLine = async () => {
    const response = await fetch(baseUrl + "machine");
    return await response.json(); // Return the fetched products
  };

  const handleChange = async (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "recipe_code") {
      const ingred = await renderIngredients(e.target.value);
      if(ingred !== "other"){
        setHasChanged(true);
      }
      setIngredients(ingred);
    }
    console.log("mix: " + e.target.name + " : " + e.target.value);
  };

  const handleChangeMaterial = async (e) => {
    setHasChanged(true);
    await handleChange(e);

  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = moment(date).format("jYYYY-jMM-jDD"); // Convert to Jalali date
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }));
    document.getElementsByClassName("react-calendar")[0].classList.add("no");
    document.getElementsByClassName("date")[0].getElementsByTagName("p")[0].classList.remove("no");
  };
  const handleTimeChange = (e) => {
    const newTime = e.target.value
    console.log("New time: " + newTime)
    setSelectedTime(newTime);
    setFormData((prevData) => ({
      ...prevData,
      time: newTime,
    }));
    document.getElementsByClassName("time-picker")[0].classList.add("no");
    document.getElementsByClassName("time")[0].getElementsByTagName("p")[0].classList.remove("no");
  };
  // When product name is selected, update corresponding fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    alert(`Form Submitted:
    ${JSON.stringify(formData, null, 4)}`);
    if(hasChanged){
      // post to different endpoints
    }else{
      // await fetch(baseUrl + "/mixentry", {
      //   method: "POST",
      //   body: JSON.stringify(formData),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
    }
    
  };

  const renderIngredients = async (mixCode) => {
    let ans = (
      <div className="input-group auto">هیچ میکسی انتخاب نشده است.</div>
    );
    if (mixCode) {
      let mix_ingreds = null;
      try {
        mix_ingreds = await (await fetch(baseUrl + "material/" + mixCode)).json();
      } catch (err) {
        return ans;
      }
      setFormData((prevData) => ({
        ...prevData,
        ...mix_ingreds,
      }));
      return (
        <div className="auto-container">
          {mix_ingreds.map((ingred) => (
            <div className="input-group auto">
              <label>{ingred.rawmaterial.rawmaterial}</label>
              <input
                type="text"
                name={ingred.rawmaterial.rawmaterial}
                value={ingred.weight}
                onChange={handleChangeMaterial}
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
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="fa-IR"
            className="no"
          />
          <p 
            onClick={() => {
              document.getElementsByClassName("react-calendar")[0].classList.remove("no");
              document.getElementsByClassName("date")[0].getElementsByTagName("p")[0].classList.add("no");
            }}
          >
            {moment(selectedDate).format("jYYYY/jMM/jDD")}
          </p>
        </div>

        <div className="input-group time">
          <label htmlFor="time">زمان</label>
          <p 
            onClick={() => {
              document.getElementsByClassName("time-picker")[0].classList.remove("no");
              document.getElementsByClassName("time")[0].getElementsByTagName("p")[0].classList.add("no");
            }}
          >
            {formData.time}
          </p>
          <input 
            aria-label="Time" 
            type="time" 
            className="time-picker no"
            value={selectedTime}
            onChange={handleTimeChange}/>
          
        </div>

        {/* Operator selection dropdown */}
        <div className="input-group">
          <label htmlFor="operator_id">نام اپراتور</label>
          <select
            id="operator_id"
            name="operator_id"
            value={formData.operator_id}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {operatorOptions.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.name}
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
            <option value="1">صبح</option>
            <option value="2">ظهر</option>
            <option value="3">شب</option>
          </select>
        </div>
        
        {/* Line selection dropdown */}
        <div className="input-group">
          <label htmlFor="line_id">خط تولید</label>
          <select
            id="line_id"
            name="line_id"
            value={formData.line_id}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {lineOptions.map((line) => (
              <option key={line.id} value={line.id}>
                {line.machine}
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
          <label htmlFor="product_id">نام محصول</label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {Object.keys(productOptions).map((productId) => (
              <option key={productId} value={productId}>
                {productOptions[productId].name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="recipe_code">نام میکس</label>
          <select
            id="recipe_code"
            name="recipe_code"
            value={formData.recipe_code}
            onChange={handleChange}
            required
          >
            <option value="other">سایر</option>
            {mixOptions.map((mix) => (
              <option key={mix.id} value={mix.id}>
                {mix.material}
              </option>
            ))}
          </select>
        </div>

        {ingredients}

        <div className="input-group desc">
          <label htmlFor="description">توضیحات</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
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
