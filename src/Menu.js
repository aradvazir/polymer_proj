import React from 'react';
import './Menu.css'; // Import the CSS file for styling
const setCookie = (name, value) => {
  let expires = "";
  const date = new Date();
  date.setTime(date.getTime() + (60 * 60 * 1000));
  expires = "; expires=" + date.toUTCString();
  // Construct the cookie string
  const cookieString = `${name}=${value || ""}${expires}; path=/; SameSite=None; Secure`;
  document.cookie = cookieString;
}

const Menu = () => {
  return (
    <div className="menu__wrapper">
      <div className="menu__box">
        {/* <h1 className="menu__title">منو</h1> */}
        <ul className="menu__options">
          <li>
            <a href="/mixentry" className="menu__option">ورود اطلاعات میکس</a>
          </li>
          <li>
            <a href="/datatable" className="menu__option">مشاهده جدول ها</a>
          </li>
          <li>
            <a href="/datatable" className="menu__option" onClick={setCookie("table", "users")}>کاربران</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Menu;