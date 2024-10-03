import React from 'react';
import './Menu.css'; // Import the CSS file for styling

const Menu = () => {
  return (
    <div className="menu-container">
      <h1 className="menu-title">منو</h1>
      <ul className="menu-options">
        <li>
          <a href="/page1" className="menu-option">گزینه ۱</a>
        </li>
        <li>
          <a href="/page2" className="menu-option">گزینه ۲</a>
        </li>
        <li>
          <a href="/page3" className="menu-option">گزینه ۳</a>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
