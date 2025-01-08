import React, { useEffect, useState, useCallback } from "react";
import './SearchableDropdown.css';



const SearchableDropdown = ({ items, placeholder, onSelect }) => {
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items);
  }, [items])
  const handleSearch = (e) => {
    setSearch(e.target.value);
    const toSearch = e.target.value.toLowerCase();
    const filtered_keys = Object.keys(items).filter(
      (item) => {
        const searchable = items[item].toString().toLowerCase();
        return searchable.includes(toSearch) ||
          searchable.replace(/ي/g, 'ی').includes(toSearch);
        
      }
    );
    const ans = filtered_keys.reduce((agg, key) => {
      let finalKey;
      try{
        finalKey = parseInt(key)
      }catch(_){
        finalKey = key;
      }
      agg[finalKey] = items[finalKey];
      return agg;
    }, {})
    console.log('After: ', ans);
    setFilteredItems(ans);
  };

  const handleSelect = (value) => {
    setSearch(items[value].toString());
    if(onSelect)
      onSelect(value);
  };
  const showItems = useCallback(() => {
    document.getElementsByClassName('searchable-dd')[0].getElementsByClassName('sdd-items')[0].classList.add('show');
    // $('.searchable-dd .sdd-input')[0].style.borderBottomLeftRadius = 
    //   Object.keys(filteredItems).length > 0 ? '0' : '15px';
    // $('.searchable-dd .sdd-input')[0].style.borderBottomRightRadius = 
    //   Object.keys(filteredItems).length > 0 ? '0' : '15px';
    
    if(Object.keys(filteredItems).length === 0){
      console.log('Empty filter:', filteredItems);
    }
  }, []);
  const hideItems = useCallback(() => {
    document.getElementsByClassName('searchable-dd')[0].getElementsByClassName('sdd-items')[0].classList.remove('show');
    // $('.searchable-dd .sdd-input')[0].style.borderBottomLeftRadius = '15px';
    // $('.searchable-dd .sdd-input')[0].style.borderBottomRightRadius = '15px';
  }, []);
  
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
      <ul className="sdd-items">
        {Object.keys(filteredItems).map((item) => (
          <li 
            key={item}
            onMouseDown={() => handleSelect(item)}
            className="sdd-item"
          >{items[item]}</li>
        ))}
      </ul>
    </div>
  );
}

export default SearchableDropdown;