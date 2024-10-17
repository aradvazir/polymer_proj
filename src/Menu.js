import React, { useEffect, useState } from "react";
import "./Menu.css"; // Import the CSS file for styling
import { setCookie, getCookie } from "./consts";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const navigate = useNavigate(getCookie("role"));
  const [role, setRole] = useState();
  const [users_permission, setUsersPerm] = useState(false);
  const [mix_permission, setMixPerm] = useState(false);
  useEffect(() => {
    setRole(getCookie("role"));
    setUsersPerm(role === "admin" || role === "manager");
    setMixPerm(role === "admin" || role === "manager" || role === "editor");
    
  }, [role]);
  return (
    <div className="menu__wrapper">
      <div className="menu__box">
        {/* <h1 className="menu__title">منو</h1> */}
        <ul className="menu__options">
          {mix_permission && (
          <li>
            <a href="/#/mixentry" className="menu__option">
              ورود اطلاعات میکس
            </a>
          </li>)}
          <li>
            <a
              href="/#/datatable"
              className="menu__option"
              onClick={() => {
                setCookie("table", "");
                navigate("/datatable");
              }}
            >
              مشاهده جدول ها
            </a>
          </li>
          {users_permission && (
            <li>
              <a
                href="/#/datatable"
                className="menu__option"
                onClick={() => {
                  setCookie("table", "users");
                  navigate("/datatable");
                }}
              >
                کاربران
              </a>
            </li>
          )}
          <li>
            <a
              href="/"
              className="menu__option"
              onClick={() => {
                setCookie("token", "");
                setCookie("role", "");
                navigate("/");
              }}
            >
              خروج
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Menu;
