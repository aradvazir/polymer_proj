import React, { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import moment from "moment-jalaali"
import SearchableDropdown from './SearchableDropdown';
import { baseUrl, getCookie, setCookie, sleep, convertFarsiDigitsToEnglish } from "./consts";
import { Toast } from "react-bootstrap";
import "./Form.css";
const connection_error = "متاسفانه اتصال با سرور برقرار نیست"

const Form = () => {
  const [formData, setFormData] = useState({
    date: getCookie("date") ? getCookie('date') : "",
    time_start: getCookie("time_start") ? getCookie('time_start') : moment().format("HH:mm"),
    time_end: getCookie("time_end") ? getCookie('time_end') : moment().format("HH:mm"),
    operator_id: getCookie("operator_id") ? getCookie("operator_id") : "",
    shift: getCookie("shift") ? getCookie("shift") : "",
    line_id: getCookie("line_id") ? getCookie("line_id") : "",
    amount: getCookie("amount")
      ? getCookie("amount")
      : 0,
    product_id: getCookie("product_id") ? getCookie("product_id") : "",
    recipe_code: getCookie("recipe_code") ? getCookie("recipe_code") : "16",
    recipe: {},
    description: getCookie("description") ? getCookie("description") : "",
    category: getCookie("category") ? getCookie("category") : "اتصالات",
  });

  const [iscategory, setcategory] = useState(
    getCookie("category") ? getCookie("category") : "اتصالات"
  );
  const [productOptions, setProductOptions] = useState([]);
  const [mixOptions, setMixOptions] = useState([]);
  const [token, setToken] = useState(
    getCookie("token") ? getCookie("token") : ""
  );
  
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [defaultIngreds, setDefaultIngreds] = useState({});
  const [modified_rawmaterials, setModifiedRawmaterials] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeStartInput, setTimeStartInput] = useState(moment().format("HH:mm"));
  const [timeEndInput, setTimeEndInput] = useState(moment().format("HH:mm"));
  const [showToast, setShowToast] = useState(""); // For error toast
  const [toastType, setToastType] = useState(""); // For error toast
  const [confirmedTimeStart, setConfirmedTimeStart] = useState(timeStartInput);
  const [confirmedTimeEnd, setConfirmedTimeEnd] = useState(timeEndInput);
  const [hasChanged, setHasChanged] = useState(false);
  const [operatorType, setOperatorType] = useState("میکسر");

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  // Automatically set date and time on component load
  useEffect(() => {
    const fetchOptions = async () => {
      try{
        const products = await (
          await fetch(`${baseUrl}product/${iscategory}`)
        ).json();
        setProductOptions(products || []);
        const mix = await (await fetch(`${baseUrl}materials/`)).json();
        setMixOptions(mix);
        let operators = await (
          await fetch(`${baseUrl}operator/${operatorType}/`)
        ).json();
        if(operators.detail === "Operator not found"){
          operators = [];
          let err_msg = (showToast ? showToast + "\n" : "") + "اپراتوری یافت نشد"
          setShowToast(err_msg);
          setToastType("error");
        }
        setOperatorOptions(operators);
        const lines = await (
          await fetch(`${baseUrl}machine/${iscategory}/`)
        ).json();
        setLineOptions(lines);
      }catch(err){
        console.log(err);
        if(err instanceof TypeError){
          setShowToast(connection_error);
          setToastType("error")
        }
      }
      
    };
    fetchOptions();
    
    let currentPersianDate;
    if (getCookie("date") === "") {
      currentPersianDate = new Date().toLocaleDateString("fa-IR");
    }else{
      currentPersianDate = getCookie("date");
    }
    setCookie("date", currentPersianDate);
    setSelectedDate(currentPersianDate);

    let currentTimeStart;
    if(!getCookie("time_start")){
      currentTimeStart = moment().format("HH:mm"); // 24-hour time
    }else{
      currentTimeStart = getCookie('time');
    }
    setCookie('time_start', currentTimeStart);
    setConfirmedTimeStart(currentTimeStart);
    let currentTimeEnd;
    if(!getCookie("time_end")){
      currentTimeEnd = moment().format("HH:mm"); // 24-hour time
    }else{
      currentTimeEnd = getCookie('time');
    }
    setCookie('time_end', currentTimeEnd);
    setConfirmedTimeEnd(currentTimeEnd);
    
    setFormData((prevData) => {
      const updatedFormData = {
          ...prevData,
          date: currentPersianDate,
          time_start: currentTimeStart,
          time_end: currentTimeEnd,
      };
      return updatedFormData;
    });
    setToken(getCookie("token"));
    setOperatorType("میکسر")
    
  }, []);

  const updateIngredients = async (mixCode) => {
    let mix_ingreds = null;
    try {
      mix_ingreds = await (
        await fetch(`${baseUrl}material/${mixCode}/`)
      ).json();
    } catch (err) {
      setModifiedRawmaterials({});
      return;
    }
    if(mix_ingreds && mix_ingreds.detail === "Material not found"){
      setModifiedRawmaterials({});
      return;
    }
    function id_weight_Ingredients(ing_obj) {
      const newObj = {};

      Object.keys(ing_obj).forEach((key) => {
        newObj[ing_obj[key].rawmaterial.id] = parseFloat(ing_obj[key].weight);
      });

      return newObj;
    }

    const defaults = id_weight_Ingredients(mix_ingreds);
    setCookie("defaultIngreds", JSON.stringify(defaults));
    const newForm = {
      ...formData,
      recipe: {
        ...defaults,
        ...formData.recipe,
      },
    };
    setFormData(newForm);
    setDefaultIngreds(defaults);
    const rawmaterials = {};
    mix_ingreds.forEach(ingred => {
      if(Object.keys(rawmaterials).includes(ingred.rawmaterial.rawmaterial)){
        rawmaterials[ingred.rawmaterial.rawmaterial].push({
          ...ingred.rawmaterial
        })
      }else{
        rawmaterials[ingred.rawmaterial.rawmaterial] = [{
          ...ingred.rawmaterial
        }]
      }
    })
    console.log({rawmaterials})
    setModifiedRawmaterials(rawmaterials);
    
  }
  useEffect(() => {
    const start_recipe = async () => {
      await updateIngredients(formData.recipe_code);
      setHasChanged(false);
    };
    start_recipe();
  }, []);

  const handleRecipeCodeChange = async (e) => {
    const value = e.target.value;
    await updateIngredients(value);
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setHasChanged(false);
    setCookie(e.target.name, value);
    // window.location.reload();
  };
  const handleRecipeChange = async (MaterialKey, weight) => {
    let defaults = JSON.parse(getCookie("defaultIngreds")) || {};
    defaults[MaterialKey] = weight;
    setCookie("defaultIngreds", JSON.stringify(defaults));
    const category = Object.keys(modified_rawmaterials)
      .find(cat => modified_rawmaterials[cat].map(item => item.id).includes(parseInt(MaterialKey)));
    const newRecipe = {
      ...defaults,
      ...defaultIngreds,
      ...formData.recipe,
    };
    modified_rawmaterials[category].forEach(item => {
      newRecipe[item.id] = 0;
    });
    newRecipe[MaterialKey] = weight;
    setFormData({
      ...formData,
      recipe: newRecipe,
    });
    setHasChanged(true);
  };

  const handleChange = async (e) => {
    if (e.target.name.startsWith("recipe_")) {
      await handleRecipeChange(e.target.nextSibling.value, parseFloat(e.target.value) || "");
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setCookie(e.target.name, e.target.value);
    }
  };

  const handleDateChange = (date) => {
    const persianDate = date.format(); // Use the new Persian date
    setSelectedDate(date);
    setFormData((prevData) => {
        const updatedFormData = {
            ...prevData,
            date: persianDate, // Format as per Persian date
        };
        return updatedFormData;
    });
    setCookie("date", persianDate);
  };

  const handleTimeStartInputChange = (event) => {
    setTimeStartInput(event.target.value);
  };
  const handleTimeEndInputChange = (event) => {
    setTimeEndInput(event.target.value);
  };

  const handleSaveTimeStart = () => {
    setConfirmedTimeStart(timeStartInput); // Update confirmed time
    setFormData((prevData) => {
      const updatedFormData = {
          ...prevData,
          time_start: timeStartInput, // Format as per Persian date
      };
      return updatedFormData;
    });
    setCookie("time_start", timeStartInput);
    closeTimeStartInput(); // Close input
  };
  const handleSaveTimeEnd = () => {
    setConfirmedTimeEnd(timeEndInput); // Update confirmed time
    setFormData((prevData) => {
      const updatedFormData = {
          ...prevData,
          time_end: timeEndInput, // Format as per Persian date
      };
      return updatedFormData;
    });
    setCookie("time_end", timeEndInput);
    closeTimeEndInput(); // Close input
  };

  const openTimeStartInput = () => {
    document.getElementById("time-start-input").classList.remove("no");
    document.getElementById("time-start-text").classList.add("no");
  };

  const closeTimeStartInput = () => {
    document.getElementById("time-start-input").classList.add("no");
    document.getElementById("time-start-text").classList.remove("no");
  };
  const openTimeEndInput = () => {
    document.getElementById("time-end-input").classList.remove("no");
    document.getElementById("time-end-text").classList.add("no");
  };

  const closeTimeEndInput = () => {
    document.getElementById("time-end-input").classList.add("no");
    document.getElementById("time-end-text").classList.remove("no");
  };

  const handleProductToggle = async(isfit) => {
    setcategory(isfit);
    setFormData((prevData) => ({
      ...prevData,
      category: isfit,
    }));
    setCookie("category", isfit);
    const products = await (
      await fetch(`${baseUrl}product/${isfit}/`)
    ).json();
    
    setProductOptions(products);
    const lines = await (
      await fetch(`${baseUrl}machine/${isfit}/`)
    ).json();
    setLineOptions(lines);
    
  };

  useEffect(() => {
    console.log({formData});
    
  }, [formData]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasChanged) {
      let finalForm = { recipe: {} }; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach((key) => {
        if (key === "recipe_code" || key === "recipe") {
        } else if (
          key === "product_id" ||
          key === "description" ||
          key === "category"
        ) {
          finalForm[key] = formData[key];
        } else if (key === "date") {
          finalForm[key] = formData[key] || selectedDate;
          finalForm[key] = convertFarsiDigitsToEnglish(finalForm[key]);
        } else if (key === "time_start") {
          finalForm[key] = formData[key] || timeStartInput;
        } else if (key === "time_end") {
          finalForm[key] = formData[key] || timeEndInput;
        } else {
          finalForm[key] = parseInt(formData[key]);
        }
      });
      let weight = 0;
      Object.keys(formData.recipe).forEach((key) => {
        weight = parseFloat(formData.recipe[key])
        if (weight) {
          finalForm.recipe[key] = weight;
        }
      });
      console.log(
        "Final Form (has changed): " + JSON.stringify(finalForm, null, 4)
      );

      try{
        const resp = await fetch(baseUrl + "mixentry/other/", {
          method: "POST",
          body: JSON.stringify(finalForm),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if(resp.ok){
          setToastType("success");
          setShowToast("با موفقیت ثبت شد");
          await sleep(5000);
          window.location.reload();
        }else if(resp.status === 403){
          throw ReferenceError("شما دسترسی لازم برای اضافه کردن را ندارید!")
        }
      }catch(err){
        if(err instanceof ReferenceError || err instanceof SyntaxError){
          setToastType("error");
          setShowToast(err.message);
        }else{
          setToastType("error");
          setShowToast("سرور دچار مشکل شده است. لطفا مجدد تلاش کنید");
        }
        
        return;
      }
      

      // post to different endpoints
    } else {
      let finalForm = {}; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach((key) => {
        if (key === "recipe") {
        } else if (
          key === "product_id" ||
          key === "description" ||
          key === "category"
        ) {
          finalForm[key] = formData[key];
        } else if (key === "date") {
          finalForm[key] = formData[key] || selectedDate;
          finalForm[key] = convertFarsiDigitsToEnglish(finalForm[key]);
        } else if (key === "time_start") {
          finalForm[key] = formData[key] || timeStartInput;
        } else if (key === "time_end") {
          finalForm[key] = formData[key] || timeEndInput;
        } else {
          finalForm[key] = parseInt(formData[key]);
        }
      });
      console.log(
        "Final Form (not changed): " + JSON.stringify(finalForm, null, 4)
      );

      try{
        const resp = await fetch(baseUrl + "mixentry/", {
          method: "POST",
          body: JSON.stringify(finalForm),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if(resp.ok){
          setToastType("success");
          setShowToast("با موفقیت ثبت شد");
          await sleep(5000);
          window.location.reload();
        }else if(resp.status === 403){
          throw ReferenceError("شما دسترسی لازم برای اضافه کردن را ندارید!")
        }
      }catch(err){
        if(err instanceof ReferenceError || err instanceof SyntaxError){
          setToastType("error");
          setShowToast(err.message);
        }else{
          setToastType("error");
          setShowToast("سرور دچار مشکل شده است. لطفا مجدد تلاش کنید");
        }
        
        return;
      }
    }
  };

  
  return (
    <div className="form__form-container">
      <div style={{ visibility: "hidden" }}>
        {JSON.stringify(defaultIngreds)}
      </div>
      <form onSubmit={async (e) => {
        await handleSubmit(e);
      }} 
        className="form__form">
        <div
          className="redirect-container"
          style={{
            marginBottom: "20px",
            width: "125px",
            position: "absolute",
            top: "0px",
            left: "0px",
            display: "flex",
          }}
        >
          <a
            href="/#/Menu"
            className="redirect-button"
            style={{
              display: "inline-flex",
              padding: "10px 20px",
              backgroundColor: "#e10d0d",
              color: "white",
              textDecoration: "none",
              borderRadius: "10px",
              border: "1px solid black",
              transition: "background-color 0.3s",
              width: "100%",
              fontSize: "16px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#ba0d0d";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#e10d0d";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            بازگشت به منو
          </a>
        </div>

        <h2>اطلاعات تولید</h2>

        <div className="form__input-group-special form__date">
          <label htmlFor="date">تاریخ</label>
            <div className="form__date-display">
              <DatePicker
                weekDays={weekDays}
                value={selectedDate}
                onChange={handleDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
              />
            </div>
        </div>

        <div className="form__input-group-special form__time">
          <label htmlFor="">زمان شروع</label>
          <div className="form__clock-display">
            <div id="time-start-input" className="no">
              <input
                type="time"
                value={timeStartInput}
                onChange={handleTimeStartInputChange}
                className="form__time-input"
              />
              <button
                type="button"
                className="form__action-button form__save-button"
                onClick={handleSaveTimeStart}
              >
                ذخیره
              </button>
              <button
                type="button"
                className="form__action-button form__cancel-button"
                onClick={closeTimeStartInput}
              >
                لغو
              </button>
            </div>
            <div id="time-start-text">
              <p onClick={openTimeStartInput}>
                {moment(confirmedTimeStart, "HH:mm").format("HH:mm")}
              </p>
            </div>
          </div>
        </div>
        
        <div className="form__input-group-special form__time">
          <label htmlFor="">زمان پایان</label>
          <div className="form__clock-display">
            <div id="time-end-input" className="no">
              <input
                type="time"
                value={timeEndInput}
                onChange={handleTimeEndInputChange}
                className="form__time-input"
              />
              <button
                type="button"
                className="form__action-button form__save-button"
                onClick={handleSaveTimeEnd}
              >
                ذخیره
              </button>
              <button
                type="button"
                className="form__action-button form__cancel-button"
                onClick={closeTimeEndInput}
              >
                لغو
              </button>
            </div>
            <div id="time-end-text">
              <p onClick={openTimeEndInput}>
                {moment(confirmedTimeEnd, "HH:mm").format("HH:mm")}
              </p>
            </div>
          </div>
        </div>

        <div className="form__input-group-special single-row">
          <label>محصول تولیدی</label>
          <div className="form__toggle-buttons">
            <div
              className={`form__toggle-button ${
                iscategory === "اتصالات" ? "active" : ""
              }`}
              onClick={async() => {await handleProductToggle("اتصالات")}}
            >
              اتصالات
            </div>
            <div
              className={`form__toggle-button ${
                iscategory === "لوله" ? "active" : ""
              }`}
              onClick={async() => {await handleProductToggle("لوله")}}
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
            {(operatorOptions || []).map((operator) => (
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
            {lineOptions && lineOptions.length && lineOptions.map((line) => (
              <option key={line.id} value={line.id}>
                {line.machine}
              </option>
            ))}
          </select>
        </div>

        <div className="form__input-group-special">
          <label htmlFor="amount">مقدار تولید</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form__input-group-special">
          <label htmlFor="product_id">محصول</label>
          <SearchableDropdown
           items={
            productOptions.reduce((acc, prod) => {
              acc[prod.code] = prod.name
              return acc;
            }, {})
           }
           onSelect={(prod_code) => {
            setFormData({
              ...formData,
              product_id: prod_code,
            });
            setCookie('product_id', prod_code);
           }}
           id='product_id'
          />
          {/* <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب کنید</option>
            {productOptions && productOptions.length && productOptions.map((product) => (
              <option key={product.code} value={product.code}>
                {product.name}
              </option>
            ))}
          </select> */}
        </div>

        <div className="form__input-group-special">
          <label htmlFor="recipe_code">گروه محصولات</label>
          <select
            id="recipe_code"
            name="recipe_code"
            value={formData.recipe_code}
            onChange={handleRecipeCodeChange}
          >
            <option key="16" value="16">
              سایر
            </option>
            {mixOptions.map((mix) => (
              <option key={mix.id} value={mix.id}>
                {mix.material}
              </option>
            ))}
          </select>
        </div>

        {formData.recipe_code ? (
          (
            <div className="form__auto-container">
              {Object.keys(modified_rawmaterials).map((ingred) => (
                <div
                  className="form__input-group-special auto"
                  // key={ingred.rawmaterial.id}
                >
                  <label>{ingred}</label>
                  <input
                    type="text"
                    name={`recipe_`}
                    defaultValue={ingred.weight}
                    onChange={handleChange}
                  />
                  <select
                    // onChange={}
                    defaultValue={modified_rawmaterials[ingred][0].id}
                    onChange={(e) => {
                      const prevKey = e.currentTarget.key;
                      e.target.previousSibling.value = null;
                      handleRecipeChange(e.target.value, 0);
                    }}
                    required
                  >
                    {(modified_rawmaterials[ingred] || []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.company}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="form__input-group-special auto">
            هیچ میکسی انتخاب نشده است.
          </div>
        )}

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
      <Toast
        onClose={() => {setShowToast(""); setToastType("")}}
        show={showToast.length > 0}
        delay={7000}
        autohide
        style={{position: "fixed", top: "20px", right: "20px", backgroundColor: toastType === 'error' ? "rgba(153, 17, 34, 0.5)" : 
          toastType === "success" ? "rgba(17, 240, 89, 0.5)" : 
          "rgba(255, 255, 255, 0.5)", color: "black" }}
      >
        <Toast.Body>{showToast}</Toast.Body>
      </Toast>
    </div>
    
  );
};

export default Form;
