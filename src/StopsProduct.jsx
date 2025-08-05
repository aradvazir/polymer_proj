import React, { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import moment from "moment-jalaali"
import { baseUrl, getCookie, setCookie, sleep, convertFarsiDigitsToEnglish } from "./consts";
import { Toast } from "react-bootstrap";
import "./Form.css";
import SearchableDropdown from "./SearchableDropdown";
const connection_error = "متاسفانه اتصال با سرور برقرار نیست"

const StopsProduct = () => {
  const [formData, setFormData] = useState({
    finalproduct_id: getCookie("finalproduct_id") ? getCookie("finalproduct_id") : "",
    operator_id: getCookie("operator_id") ? getCookie("operator_id") : "",
    stop_id: getCookie("stop_id") ? getCookie("stop_id") : "",
    start_date: getCookie("start_date") ? getCookie("start_date") : "",
    start_time: getCookie("start_time") ? getCookie("start_time") : "",
    end_date: getCookie("end_date") ? getCookie("end_date") : "",
    end_time: getCookie("end_time") ? getCookie("end_time") : "",
    shift: getCookie("shift") ? getCookie("shift") : "",
    description: getCookie("description") ? getCookie("description") : "",
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
  const [modified_rawmaterials, setModifiedRawmaterials] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeStartInput, setTimeStartInput] = useState(moment().format("HH:mm"));
  const [timeEndInput, setTimeEndInput] = useState(moment().format("HH:mm"));
  const [showToast, setShowToast] = useState(""); // For error toast
  const [toastType, setToastType] = useState(""); // For error toast
  const [confirmedTimeStart, setConfirmedTimeStart] = useState(timeStartInput);
  const [confirmedTimeEnd, setConfirmedTimeEnd] = useState(timeEndInput);
  const [stops, setStops] = useState([]);

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  useEffect(() => {
      const fetchFinalProductData = async () => {
        if (formData.finalproduct_id !== null) {
          try {
            const response = await fetch(`${baseUrl}table/finalproducts/${formData.finalproduct_id}`);
            const data = await response.json();
            if (data?.type) {
              setcategory(data?.type);
            }
            if (!response.ok)
            {
              setToastType("warning");
              setShowToast(`کد تولید ${formData.finalproduct_id} یافت نشد`);
              sleep(1000);
            }
            else {
              setToastType("success");
              setShowToast(`کد تولید ${formData.finalproduct_id} یافت شد`);
              sleep(1000);
            }
          } catch (error) {
            setToastType("warning");
            setShowToast(`کد تولید ${formData.finalproduct_id} یافت نشد`);
            sleep(1000);
          }
        }
      };
      fetchFinalProductData();
    }, [formData.finalproduct_id]);

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
          await fetch(`${baseUrl}operator/${iscategory}`)
        ).json();
        if(operators.detail === "Operator not found"){
          operators = [];
          let err_msg = (showToast ? showToast + "\n" : "") + "اپراتوری یافت نشد"
          setShowToast(err_msg);
          setToastType("error");
        }
        setOperatorOptions(operators);
        const stops = await (
          await fetch(`${baseUrl}values/stops/0/100/id/true/`)
        ).json();
        setStops(stops);
        console.log('amir', stops);
        const lines = await (
          await fetch(`${baseUrl}machine/${iscategory}`)
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
    setToken(getCookie("token")); 
    let currentPersianDate = getCookie("start_date") || new Date().toLocaleDateString("fa-IR");
    setCookie("start_date", currentPersianDate);
    setFormData(prev => ({ ...prev, start_date: currentPersianDate }));

    let currentEndDate = getCookie("end_date") || new Date().toLocaleDateString("fa-IR");
    setCookie("end_date", currentEndDate);
    setFormData(prev => ({ ...prev, end_date: currentEndDate }));

    let currentTimeStart = getCookie("start_time") || moment().format("HH:mm");
    setCookie("start_time", currentTimeStart);
    setTimeStartInput(currentTimeStart);
    setConfirmedTimeStart(currentTimeStart);
    setFormData(prev => ({ ...prev, start_time: currentTimeStart }));

    let currentTimeEnd = getCookie("end_time") || moment().format("HH:mm");
    setCookie("end_time", currentTimeEnd);
    setTimeEndInput(currentTimeEnd);
    setConfirmedTimeEnd(currentTimeEnd);
    setFormData(prev => ({ ...prev, end_time: currentTimeEnd }));
  }, [iscategory]);
  // useEffect(() => {
  //   if(mixId !== null){

  //   }
  // }, [mixId])

  useEffect(() => {
    const fetchFinalProductData = async () => {
      if (formData.finalproduct_id !== null && formData.operator_id !== null) {
        try {
          const response = await fetch(`${baseUrl}finalprodoperate/${formData.operator_id}/${formData.finalproduct_id}`);
            if (!response.ok) {
                setToastType("warning");
                setShowToast(`اپراتور ورودی برای کد تولید ${formData.finalproduct_id} یافت نشد`);
                sleep(1000);
            }
            else {
                setToastType("success");
                setShowToast(`اپراتور ورودی برای کد تولید ${formData.finalproduct_id} یافت شد`);
                sleep(1000);
            }
        } catch (error) {
          setToastType("warning");
          setShowToast(`اپراتور ورودی برای کد تولید ${formData.finalproduct_id} یافت نشد`);
          sleep(1000);
        }
    }

    };
    fetchFinalProductData();
  }, [formData.finalproduct_id, formData.operator_id]);

  const handleChange = async (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setCookie(e.target.name, e.target.value);
  };


  const handleStartDateChange = (date) => {
  const formatted = date.format();
  console.log('an', formatted);
  setFormData(prev => ({ ...prev, start_date: formatted }));
  setCookie("start_date", formatted);
};
const handleEndDateChange = (date) => {
  const formatted = date.format();
  setFormData(prev => ({ ...prev, end_date: formatted }));
  setCookie("end_date", formatted);
};



  const handleTimeStartInputChange = (event) => {
    setTimeStartInput(event.target.value);
  };
  const handleTimeEndInputChange = (event) => {
    setTimeEndInput(event.target.value);
  };

  const handleSaveTimeStart = () => {
  setConfirmedTimeStart(timeStartInput);
  setFormData(prev => ({ ...prev, start_time: timeStartInput }));
  setCookie("start_time", timeStartInput);
  closeTimeStartInput();
};

const handleSaveTimeEnd = () => {
  setConfirmedTimeEnd(timeEndInput);
  setFormData(prev => ({ ...prev, end_time: timeEndInput }));
  setCookie("end_time", timeEndInput);
  closeTimeEndInput();
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

  useEffect(() => {
    console.log({formData});
    
  }, [formData]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      const startDateTime = moment(`${convertFarsiDigitsToEnglish(formData.start_date)} ${formData.start_time}`, "jYYYY/jMM/jDD HH:mm");
      const endDateTime = moment(`${convertFarsiDigitsToEnglish(formData.end_date)} ${formData.end_time}`, "jYYYY/jMM/jDD HH:mm");
      console.log('eeee', convertFarsiDigitsToEnglish(formData.start_date));
      console.log('eefdsfdsee', endDateTime);
      if (!startDateTime.isBefore(endDateTime)) {
        setToastType("error");
        setShowToast("زمان شروع باید قبل از زمان پایان باشد.");
        return;
      }
      let finalForm = formData; // it contains all the default keys, and rawmats are in the `recipe`
      Object.keys(formData).forEach((key) => {
      if (key === "start_date" || key === "end_date") {
        finalForm[key] = convertFarsiDigitsToEnglish(formData[key]);
      } else if (key === "start_time") {
        finalForm[key] = formData[key] || timeStartInput;
      } else if (key === "end_time") {
        finalForm[key] = formData[key] || timeEndInput;
      } else {
        finalForm[key] = formData[key];
      }
    });
    console.log(
      "Final Form (not changed): " + JSON.stringify(finalForm, null, 4)
    );
    const response = await fetch(`${baseUrl}finalprodoperate/${formData.operator_id}/${formData.finalproduct_id}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    const data = await response.json();
    if (!data?.ok) {
      setToastType("error");
      setShowToast("اپراتور موردنظر برای دستورتولید ورودی یافت نشد!");
      return;
    }
    const {start_time, end_time, start_date, end_date} = data;
    const startDateTimeProduct = moment(`${convertFarsiDigitsToEnglish(start_date)} ${start_time}`, "jYYYY/jMM/jDD HH:mm");
    const endDateTimeProduct = moment(`${convertFarsiDigitsToEnglish(end_date)} ${end_time}`, "jYYYY/jMM/jDD HH:mm");
    if (startDateTime.isBefore(startDateTimeProduct) || endDateTimeProduct.isBefore(endDateTime)) {
      setToastType("error");
      setShowToast("توقف باید در بازه زمان تولید رخ داده باشد.");
      return;
    }
    try{
        console.log('amagh', finalForm);
      const resp = await fetch(baseUrl + "stopfinalprods/", {
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
  };

  
  return (
    <div className="form__form-container">
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

        <h2>اجرای تولید نهایی</h2>

        <div className="form__input-group-special form__date">
          <label htmlFor="start_date">تاریخ شروع</label>
            <div className="form__date-display">
              <DatePicker
                weekDays={weekDays}
                value={selectedDate}
                onChange={handleStartDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
              />
            </div>
        </div>

        <div className="form__input-group-special form__date">
          <label htmlFor="start_date">تاریخ پایان</label>
            <div className="form__date-display">
              <DatePicker
                weekDays={weekDays}
                value={selectedDate}
                onChange={handleEndDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
              />
            </div>
        </div>

        <div className="form__input-group-special form__time">
        <label htmlFor="start_time">ساعت شروع</label>
        <div className="form__clock-display">
          <span
            id="time-start-text"
            onClick={openTimeStartInput}
            style={{ cursor: "pointer", width: "100%", fontSize: "180%" }}
          >
            {confirmedTimeStart}
          </span>
          <div id="time-start-input" className="no" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%" }}>
            <input
              type="time"
              value={timeStartInput}
              onChange={handleTimeStartInputChange}
              className="form__time-input"
              style={{ height: "45px", fontSize: "20px", textAlign: "center", direction: "ltr" }}
            />
            <button
              type="button"
              className="form__save-button"
              onClick={handleSaveTimeStart}
            >
              ذخیره
            </button>
          </div>
        </div>
      </div>

        <div className="form__input-group-special form__time">
          <label htmlFor="end_time">ساعت پایان</label>
          <div className="form__clock-display">
            <span
              id="time-end-text"
              onClick={openTimeEndInput}
              style={{ cursor: "pointer", width: "100%", fontSize: "180%" }}
            >
              {confirmedTimeEnd}
            </span>
            <div id="time-end-input" className="no" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%" }}>
              <input
                type="time"
                value={timeEndInput}
                onChange={handleTimeEndInputChange}
                className="form__time-input"
                style={{ height: "45px", fontSize: "20px", textAlign: "center", direction: "ltr" }}
              />
              <button
                type="button"
                className="form__save-button"
                onClick={handleSaveTimeEnd}
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>


        <div className="form__input-group-special">
          <label htmlFor="finalproduct_id">کد دستور تولید نهایی</label>
          <input
            type="number"
            id="finalproduct_id"
            name="finalproduct_id"
            value={formData.finalproduct_id}
            onChange={handleChange}
            required
          />
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

        {stops && <div className="form__input-group-special">
          <label htmlFor="stop_id">علت توقف</label>
          <SearchableDropdown
            items={
              stops.reduce((acc, stop) => {
                acc[stop.id] = stop.stop_reason
                return acc;
              }, {})
            }
            onSelect={(stop_id) => {
            setFormData({
              ...formData,
              stop_id: stop_id,
            });
            setCookie('stop_id', stop_id);
            }}
            id='stop_id'
          />
        </div>}

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

export default StopsProduct;
