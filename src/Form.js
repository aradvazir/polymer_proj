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
    recipe: {},
    description: "",
    fitting: "",
  });

  const [isFitting, setFitting] = useState("True");
  const [productOptions, setProductOptions] = useState([]);
  const [mixOptions, setMixOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [defaultIngreds, setDefaultIngreds] = useState({});
  const [ingredients, setIngredients] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeInput, setTimeInput] = useState(moment().format('HH:mm'));
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

    const currentDate = moment().format("jYYYY-jMM-jDD");
    setFormData((prevData) => ({
      ...prevData,
      date: currentDate,
      time: moment().format('HH:mm'),
    }));

  }, [isFitting]);

  
  const handleChange = async (e) => {
    if (e.target.name === "recipe_code") {
      const ingred = await renderIngredients(e.target.value);
      setIngredients(ingred);
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      console.log(`${e.target.name} -> ${e.target.value}`)
      console.log(formData);
    }else if(e.target.name.startsWith("recipe_")){
      setFormData({
        ...formData,
        recipe: {
          ...defaultIngreds,
          ...formData.recipe,
          [e.target.name]: e.target.value,
        },
      });
      setHasChanged(true);
    }else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
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
    closeTimeInput();
  };

  const openTimeInput = () => {
    document.getElementById("time-input").classList.remove("no");
    document.getElementById("time-text").classList.add("no");
    
  };
  const closeTimeInput = () => {
    document.getElementById("time-input").classList.add("no");
    document.getElementById("time-text").classList.remove("no");
    
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
    if(hasChanged){
      let finalForm = {}; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach(key => {
        if(key === "recipe_code"){
          
        }else {
          finalForm[key] = formData[key];
        }
      })
      console.log("Final Form (has changed): " + JSON.stringify(finalForm, null, 4));


      // post to different endpoints
    }else{
      let finalForm = {}; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach(key => {
        if(key === "recipe"){
          
        }else{
          finalForm[key] = formData[key];
        }
      })
      console.log("Final Form (not changed): " + JSON.stringify(finalForm, null, 4));

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
    let ans = <div className="input-group auto">هیچ میکسی انتخاب نشده است.</div>;
    if (mixCode) {
      let mix_ingreds = null;
      try {
        mix_ingreds = await (await fetch(`${baseUrl}material/${mixCode}`)).json();
      } catch (err) {
        return ans;
      }
      function convertIngredients(ing_obj, substring) {
        const newObj = {};
        
        Object.keys(ing_obj).forEach(key => {
          newObj[substring + ing_obj[key].rawmaterial.id] = ing_obj[key].weight;
          
        })
        
        return newObj;
      }
      let recipe_list = convertIngredients(mix_ingreds, "recipe_");
      console.log(recipe_list);

      setDefaultIngreds(recipe_list);
      
      return (
        <div className="auto-container">
          {mix_ingreds.map((ingred) => (
            <div className="input-group auto" key={ingred.rawmaterial.id}>
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

        <div className="input-group clock-container">
          <label htmlFor="">زمان</label>
          <div className="clock-display" >
          <div id="time-input" className="no">
            <input
              type="time"
              value={timeInput}
              onChange={handleTimeInputChange}
              className="time-input"
            />
            <button type="button" className="action-button save-button" onClick={handleSaveTime}>ذخیره</button>
            <button type="button" className="action-button cancel-button" onClick={closeTimeInput}>لغو</button>

          </div>
          <div id="time-text">
            <p onClick={openTimeInput} >{moment(timeInput, 'HH:mm').format('HH:mm')}</p>
          </div>
            
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
              <option key={product.code} value={product.code}>
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
            onChange={handleChange}
          >
            <option value="16">سایر</option>
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
