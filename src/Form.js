import React, { useState, useEffect } from "react";
import moment from "moment-jalaali";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Form.css";
import { baseUrl, getCookie, setCookie } from "./consts";


const Form = () => {
  const [formData, setFormData] = useState({
    date: moment().format("jYYYY-jMM-jDD"),
    time: moment().format("HH:mm"),
    operator_id: getCookie("operator_id") ? getCookie("operator_id") : "",
    shift: getCookie("shift") ? getCookie("shift") : "",
    line_id: getCookie("line_id") ? getCookie("line_id") : "",
    productionAmount: getCookie("productionAmount") ? getCookie("productionAmount") : "",
    product_id: getCookie("product_id") ? getCookie("product_id") : "",
    recipe_code: getCookie("recipe_code") ? getCookie("recipe_code") : "",
    recipe: {},
    description: getCookie("description") ? getCookie("description") : "",
    fitting: getCookie("fitting") ? getCookie("fitting") : "True",
  });

  const [isFitting, setFitting] = useState(getCookie("fitting") ? getCookie("fitting") : "True");
  const [productOptions, setProductOptions] = useState([]);
  const [mixOptions, setMixOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [defaultIngreds, setDefaultIngreds] = useState({});
  const [ingredients, setIngredients] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeInput, setTimeInput] = useState(moment().format("HH:mm"));
  const [confirmedTime, setConfirmedTime] = useState(timeInput);
  const [hasChanged, setHasChanged] = useState(false);

  // Automatically set date and time on component load
  useEffect(() => {
    const fetchOptions = async () => {
      const products = await (await fetch(`${baseUrl}product/${isFitting}`)).json();
      setProductOptions(products);
      const mix = await (await fetch(`${baseUrl}materials`)).json();
      setMixOptions(mix);
      const operators = await (await fetch(`${baseUrl}operator/${isFitting}`)).json();
      setOperatorOptions(operators);
      const lines = await (await fetch(`${baseUrl}machine/${isFitting}`)).json();
      setLineOptions(lines);
    };

    fetchOptions();

    moment.loadPersian({ dialect: "persian-modern" });

    const currentDate = moment().format("jYYYY-jMM-jDD"); // Persian date
    const currentTime = moment().format("HH:mm"); // 24-hour time
    setFormData((prevData) => ({
      ...prevData,
      date: currentDate,
      time: currentTime,
    }));

  }, [isFitting]);

  useEffect(() => {
    const start_recipe = async () => {
      const ingred = await renderIngredients(formData.recipe_code);
      setIngredients(ingred);
      setHasChanged(false);
    };
    start_recipe();
  }, []);

  const handleRecipeCodeChange = async(e) => {
    const value = e.target.value
    const ingred = await renderIngredients(value);
    
    setIngredients(ingred);
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setHasChanged(false);
    setCookie(e.target.name, value);
    window.location.reload();
  };
  const handleRecipeChange = async(e) => {
    const newKey = e.target.name.slice(7), newValue = parseFloat(e.target.value) || "";
    let defaults = JSON.parse(getCookie("defaultIngreds"));
    defaults[newKey] = newValue;
    setCookie("defaultIngreds", JSON.stringify(defaults));
    
    setFormData({
      ...formData,
      recipe: {
        ...defaults,
        ...defaultIngreds,
        ...formData.recipe,
        [newKey]: newValue,
      },
    });
    setHasChanged(true);
  };

  const handleChange = async (e) => {
    if(e.target.name.startsWith("recipe_")){
      await handleRecipeChange(e);
    }else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setCookie(e.target.name, e.target.value);
    }
  };

  // Handle date change using the calendar
  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = moment(date).format("jYYYY-jMM-jDD"); // Convert to Jalali date
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }));

    document.getElementsByClassName("react-calendar")[0].classList.add("no");
    document
      .getElementsByClassName("form__date-display")[0]
      .getElementsByTagName("p")[0]
      .classList.remove("no");
  };

  const handleTimeInputChange = (event) => {
    setTimeInput(event.target.value);
  };

  const handleSaveTime = () => {
    setConfirmedTime(timeInput); // Update confirmed time
    closeTimeInput(); // Close input
  };

  const openTimeInput = () => {
    document.getElementById("time-input").classList.remove("no");
    document.getElementById("time-text").classList.add("no");
    
  };

  const closeTimeInput = () => {
    setTimeInput(confirmedTime); // Reset to confirmed time
    document.getElementById("time-input").classList.add("no");
    document.getElementById("time-text").classList.remove("no");
  };
  

  const handleProductToggle = (isfit) => {
    setFitting(isfit);
    setFormData((prevData) => ({
      ...prevData,
      fitting: isfit,
    }));
    setCookie("fitting", isfit);
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    if(hasChanged){
      let finalForm = {recipe: {}}; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach(key => {
        if(key === "recipe_code" || key === "recipe"){
          
        } else if(key === "product_id" || key === "description" || key === "fitting"){
          finalForm[key] = formData[key];
        } else if(key === "date"){
          finalForm[key] = formData[key] || selectedDate;
        } else if(key === "time"){
          finalForm[key] = formData[key] || timeInput;
        } else {
          finalForm[key] = parseInt(formData[key]);
        }
      });
      Object.keys(formData.recipe).forEach(key => {
        if(formData.recipe[key]){
          finalForm.recipe[key] = formData.recipe[key];
        }
      })
      console.log("Final Form (has changed): " + JSON.stringify(finalForm, null, 4));

      await fetch(baseUrl + "mixentry/other/", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json"
        }
      });

      // post to different endpoints
    }else{
      let finalForm = {}; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach(key => {
        if(key === "recipe"){
          
        } else if(key === "product_id" || key === "description" || key === "fitting"){
          finalForm[key] = formData[key];
        } else if(key === "date"){
          finalForm[key] = formData[key] || selectedDate;
        } else if(key === "time"){
          finalForm[key] = formData[key] || timeInput;
        } else {
          finalForm[key] = parseInt(formData[key]);
        }
      })
      console.log("Final Form (not changed): " + JSON.stringify(finalForm, null, 4));

      await fetch(baseUrl + "mixentry", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
  };

  const renderIngredients = async (mixCode) => {
    let ans = <div className="form__input-group-special auto">هیچ میکسی انتخاب نشده است.</div>;
    if (mixCode) {
      let mix_ingreds = null;
      try {
        mix_ingreds = await (await fetch(`${baseUrl}material/${mixCode}`)).json();
      } catch (err) {
        return ans;
      }
      
      function id_weight_Ingredients(ing_obj) {
        const newObj = {};
        
        Object.keys(ing_obj).forEach(key => {
          newObj[ing_obj[key].rawmaterial.id] = parseFloat(ing_obj[key].weight);
          
        })
        
        return newObj;
      }
      
      const defaults = id_weight_Ingredients(mix_ingreds)
      setCookie("defaultIngreds", JSON.stringify(defaults))
    
      const newForm = {
        ...formData,
        recipe: {
          ...mix_ingreds,
          ...formData.recipe,
        },
      };
      setFormData(newForm);
      setDefaultIngreds(defaults);
      
      return (
        <div className="form__auto-container">
          {mix_ingreds.map((ingred) => (
            <div className="form__input-group-special auto" key={ingred.rawmaterial.id}>
              <label>{ingred.rawmaterial.rawmaterial}</label>
              <input
                type="text"
                name={"recipe_" + ingred.rawmaterial.id}
                defaultValue={ingred.weight}
                onChange={handleChange}
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
    <div className="form__form-container">
      <div style={{visibility: "hidden"}}>{JSON.stringify(defaultIngreds)}</div>
      <form onSubmit={handleSubmit} className="form__form">
        <h2>اطلاعات تولید</h2>

        <div className="form__input-group-special form__date">
          <label htmlFor="date">تاریخ</label>
          <div className="form__date-display">
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
                  .getElementsByClassName("form__date-display")[0]
                  .getElementsByTagName("p")[0]
                  .classList.add("no");
              }}
            >
              {moment(selectedDate).format("jYYYY/jMM/jDD")}
            </p>
          </div>
          
        </div>

        <div className="form__input-group-special form__time">
          <label htmlFor="">زمان</label>
          <div className="form__clock-display">
              <div id="time-input" className="no">
                  <input
                      type="time"
                      value={timeInput}
                      onChange={handleTimeInputChange}
                      className="form__time-input"
                  />
                  <button type="button" className="form__action-button form__save-button" onClick={handleSaveTime}>ذخیره</button>
                  <button type="button" className="form__action-button form__cancel-button" onClick={closeTimeInput}>لغو</button>
              </div>
              <div id="time-text">
                  <p onClick={openTimeInput}>{moment(confirmedTime, "HH:mm").format("HH:mm")}</p>
              </div>
          </div>
        </div>

        <div className="form__input-group-special single-row">
          <label>محصول تولیدی</label>
          <div className="form__toggle-buttons">
            <div
              className={`form__toggle-button ${isFitting === "True" ? "active" : ""}`}
              onClick={() => handleProductToggle("True")}
            >
              اتصالات
            </div>
            <div
              className={`form__toggle-button ${isFitting === "False" ? "active" : ""}`}
              onClick={() => handleProductToggle("False")}
            >
              لوله
            </div>
          </div>
        </div>

        <div className="form__input-group-special">
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
        
        <div className="form__input-group-special">
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

        <div className="form__input-group-special">
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
                {line.machine}
              </option>
            ))}
          </select>
        </div>

        <div className="form__input-group-special">
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

        <div className="form__input-group-special">
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
              <option key={product.code} value={product.code}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form__input-group-special">
          <label htmlFor="recipe_code">نام میکس</label>
          <select
            id="recipe_code"
            name="recipe_code"
            value={formData.recipe_code}
            onChange={handleRecipeCodeChange}
          >
            <option key="16" value="16" >سایر</option>
            {mixOptions.map((mix) => (
              <option key={mix.id} value={mix.id}>
                {mix.material}
              </option>
            ))}
          </select>
        </div>

        {ingredients}

        <div className="form__input-group-special desc">
          <label htmlFor="description">توضیحات</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="توضیحات خود را وارد کنید"
          ></textarea>
        </div>

        <button type="submit" className="form__submit-btn">
          ثبت
        </button>
      </form>
    </div>
  );
};

export default Form;
