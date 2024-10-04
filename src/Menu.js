import React from 'react';
import './Menu.css'; // Import the CSS file for styling
import { setCookie } from './consts';

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