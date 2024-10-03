import React from 'react';
import './Menu.css'; // Import the CSS file for styling

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
            <a href="/page3" className="menu__option">گزینه ۳</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Menu;