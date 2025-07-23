import React, { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import SearchableDropdown from './SearchableDropdown';
import { baseUrl, getCookie, setCookie, sleep, convertFarsiDigitsToEnglish } from "./consts";
import { Toast } from "react-bootstrap";
import "./Form.css";
const connection_error = "متاسفانه اتصال با سرور برقرار نیست"

const ProductOperator = () => {
  const [formData, setFormData] = useState({
  line_id: getCookie("line_id") ? getCookie("line_id") : "",
  mold_id: getCookie("mold_id") ? getCookie("mold_id") : "",
  product_id: getCookie("product_id") ? getCookie("product_id") : "",
  type: getCookie("type") ? getCookie("type") : "اتصالات",
  // color: getCookie("color") ? getCookie("color") : "",
  cycle_tobe: getCookie("cycle_tobe") ? getCookie("cycle_tobe") : 0,
  quantity_tobe: getCookie("quantity_tobe") ? getCookie("quantity_tobe") : 0,
});

  const [iscategory, setcategory] = useState(
    getCookie("type") ? getCookie("type") : "اتصالات"
  );
  const [productOptions, setProductOptions] = useState([]);
  const [molds, setMolds] = useState([]);
  const [token, setToken] = useState(
    getCookie("token") ? getCookie("token") : ""
  );
  
  const [lineOptions, setLineOptions] = useState([]);
  const [showToast, setShowToast] = useState(""); // For error toast
  const [toastType, setToastType] = useState(""); // For error toast

  // Automatically set date and time on component load
  useEffect(() => {
    const fetchOptions = async () => {
      try{
        const products = await (
          await fetch(`${baseUrl}product/${iscategory}`)
        ).json();
        setProductOptions(products || []);
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
  }, []);

  // useEffect(() => {
  //   if(mixId !== null){

  //   }
  // }, [mixId]

  const handleProductToggle = async(isfit) => {
    setcategory(isfit);
    setFormData((prevData) => ({
      ...prevData,
      type: isfit,
    }));
    setCookie("type", isfit);
    const products = await (
      await fetch(`${baseUrl}product/${isfit}`)
    ).json();
    
    setProductOptions(products);
    const lines = await (
      await fetch(`${baseUrl}machine/${isfit}`)
    ).json();
    setLineOptions(lines);
    
  };

  const handleChange = async (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
        setCookie(e.target.name, e.target.value);
  };

  useEffect(() => {
    console.log({formData});
    
  }, [formData]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        setFormData({
          ...formData,
          type: iscategory
        });
        const resp = await fetch(baseUrl + "finalprod/", {
          method: "POST",
          body: JSON.stringify(formData),
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

        <h2>دستور تولید نهایی</h2>

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

        {/* <div className="form__input-group-special">
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
            <option value="4">دوازده ساعت روز</option>
            <option value="5">دوازده ساعت شب</option>
          </select>
        </div> */}

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
          <label htmlFor="amount">تعداد تولید</label>
          <input
            type="number"
            id="quantity_tobe"
            name="quantity_tobe"
            value={formData.quantity_tobe}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form__input-group-special">
          <label htmlFor="amount">سیکل (ثانیه)</label>
          <input
            type="number"
            id="cycle_tobe"
            name="cycle_tobe"
            value={formData.cycle_tobe}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form__input-group-special">
          <label htmlFor="mold_id">قالب</label>
          <SearchableDropdown
           items={
            molds.reduce((acc, mold) => {
              acc[mold.id] = mold.mold
              return acc;
            }, {})
           }
           onSelect={(mold_id) => {
            setFormData({
              ...formData,
              mold_id: mold_id,
            });
            setCookie('mold_id', mold_id);
           }}
           id='mold_id'
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

export default ProductOperator;
