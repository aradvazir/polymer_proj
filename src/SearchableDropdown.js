import React, { useEffect, useState, useCallback, useRef } from "react";
import './SearchableDropdown.css';

const SearchableDropdown = ({ items, placeholder, onSelect }) => {
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const itemsRef = useRef(null);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    const toSearch = val.toLowerCase();
    const filteredKeys = Object.keys(items).filter((key) => {
      const text = items[key].toString().toLowerCase();
      return text.includes(toSearch) || text.replace(/ي/g, 'ی').includes(toSearch);
    });
    const filtered = filteredKeys.reduce((acc, key) => {
      acc[key] = items[key];
      return acc;
    }, {});
    setFilteredItems(filtered);
  };

  const handleSelect = (value) => {
    setSearch(items[value].toString());
    if (onSelect) onSelect(value);
  };

  const showItems = () => {
    if (itemsRef.current) itemsRef.current.classList.add('show');
  };

  const hideItems = () => {
    if (itemsRef.current) itemsRef.current.classList.remove('show');
  };

  return (
    <div className="searchable-dd">
      <input 
        type="text" 
        value={search} 
        onChange={handleSearch}
        placeholder={placeholder}
        className="sdd-input"
        onFocus={showItems}
        onBlur={hideItems}
      />
      <ul className="sdd-items" ref={itemsRef}>
        {Object.keys(filteredItems).map((key) => (
          <li
            key={key}
            onMouseDown={() => handleSelect(key)}
            className="sdd-item"
          >
            {filteredItems[key]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchableDropdown;
