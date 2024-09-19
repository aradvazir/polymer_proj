import React, { useState, useEffect } from "react";
import moment from "moment-jalaali";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
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

  const [isFitting, setFitting] = useState("True");
  const [manualTimeChange, setManualTimeChange] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [mixOptions, setMixOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [ingredients, setIngredients] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeInput, setTimeInput] = useState(moment().format('HH:mm'));

  // Automatically set date and time on component load
  useEffect(() => {
    const fetchOptions = async () => {
      const products = await loadProducts();
      setProductOptions(products);
      const mix = await loadMix();
      setMixOptions(mix);
      const operators = await loadOperator();
      setOperatorOptions(operators);
      const lines = await loadLine();
      setLineOptions(lines);
    };

    fetchOptions();

    moment.loadPersian({ dialect: "persian-modern" });

    const interval = setInterval(() => {
      if (!manualTimeChange) {
        setTimeInput(moment().format('HH:mm'));
        setFormData((prevData) => ({
          ...prevData,
          time: moment().format('HH:mm'),
        }));
      }
    }, 60000);

    const currentDate = moment().format("jYYYY-jMM-jDD");
    setFormData((prevData) => ({
      ...prevData,
      date: currentDate,
      time: moment().format('HH:mm'),
    }));

    return () => clearInterval(interval);
  }, [manualTimeChange]);

  const loadProducts = async () => {
    const response = await fetch(`${baseUrl}product/${isFitting}`);
    return await response.json();
  };

  const loadMix = async () => {
    const response = await fetch(`${baseUrl}materials`);
    return await response.json();
  };

  const loadOperator = async () => {
    const response = await fetch(`${baseUrl}operator/${isFitting}`);
    return await response.json();
  };

  const loadLine = async () => {
    const response = await fetch(`${baseUrl}machine/${isFitting}`);
    return await response.json();
  };

  const handleChange = async (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "recipe_code") {
      const ingred = await renderIngredients(e.target.value);
      setIngredients(ingred);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = moment(date).format("jYYYY-jMM-jDD");
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }));

    document.getElementsByClassName("react-calendar")[0].classList.add("no");
    document
      .getElementsByClassName("date")[0]
      .getElementsByTagName("p")[0]
      .classList.remove("no");
  };

  const handleTimeInputChange = (e) => {
    setTimeInput(e.target.value);
  };

  const handleSaveTime = () => {
    setFormData((prevData) => ({
      ...prevData,
      time: timeInput,
    }));
    setManualTimeChange(false);
  };

  const handleToggleManualTime = () => {
    setManualTimeChange(!manualTimeChange);
  };

  const handleProductToggle = (isfit) => {
    setFitting(isfit);
    setFormData((prevData) => ({
      ...prevData,
      fitting: isfit,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalForm = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "recipe_code" && key.startsWith("recipe_")) {
        // Skip recipe_code and recipe_ fields if not changed
      } else {
        finalForm[key] = formData[key];
      }
    });

    console.log("Final Form: " + JSON.stringify(finalForm, null, 4));

    // Add your submit logic here
  };

  const renderIngredients = async (mixCode) => {
    let ans = <div className="input-group auto">هیچ میکسی انتخاب نشده است.</div>;
    if (mixCode) {
      let mix_ingreds = null;
      try {
        mix_ingreds = await (await fetch(`${baseUrl}material/${mixCode}`)).json();
      } catch (err) {
        return ans;
      }
      function addSubstringToKeys(obj, substring) {
        const newObj = {};
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = key + substring;
                newObj[newKey] = obj[key];
            }
        }
        
        return newObj;
      }
      addSubstringToKeys(mix_ingreds, "recipe");
      setFormData((prevData) => ({
        ...prevData,
        ...mix_ingreds,
      }));
      return (
        <div className="auto-container">
          {mix_ingreds.map((ingred) => (
            <div className="input-group auto" key={ingred.rawmaterial.rawmaterial}>
              <label>{ingred.rawmaterial.rawmaterial}</label>
              <input
                type="text"
                name={"recipe_" + ingred.rawmaterial.rawmaterial}
                value={ingred.weight}
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
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="fa-IR"
            className="no"
          />
          <p
            onClick={() => {
              document
                .getElementsByClassName("react-calendar")[0]
                .classList.remove("no");
              document
                .getElementsByClassName("date")[0]
                .getElementsByTagName("p")[0]
                .classList.add("no");
            }}
          >
            {moment(selectedDate).format("jYYYY/jMM/jDD")}
          </p>
        </div>

        <div className="clock-container">
          <label htmlFor="">زمان</label>
          <div className="clock-display" onClick={handleToggleManualTime}>
            {manualTimeChange ? (
              <>
                <input
                  type="time"
                  value={timeInput}
                  onChange={handleTimeInputChange}
                  className="time-input"
                />
                <button type="button" onClick={handleSaveTime}>ذخیره</button>
                <button type="button" onClick={handleToggleManualTime}>لغو</button>
              </>
            ) : (
              <>
                <p>{moment(timeInput, 'HH:mm').format('HH:mm')}</p>
              </>
            )}
          </div>
        </div>

        <div className="input-group single-row">
          <label>محصول تولیدی</label>
          <div className="toggle-buttons">
            <div
              className={`toggle-button ${isFitting === 'True' ? 'active' : ''}`}
              onClick={() => handleProductToggle("True")}
            >
              اتصالات
            </div>
            <div
              className={`toggle-button ${isFitting === 'False' ? 'active' : ''}`}
              onClick={() => handleProductToggle('False')}
            >
              لوله
            </div>
          </div>
        </div>

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
            <option value="1">روز</option>
            <option value="2">شب</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="line_id">خط</label>
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
                {line.name}
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

        <div className="input-group">
          <label htmlFor="product_id">محصول</label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {productOptions.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
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
