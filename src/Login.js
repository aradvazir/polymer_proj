import React, { useState } from 'react';
import './Login.css';
import logo from './golsar.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Username:', username);
    console.log('Password:', password);
    navigate("/menu");
  };

  return (
    <div className='loginpage'>
      <div className="login__logo-container">
        <img src={logo} alt="Logo" className="login__logo" />
      </div>
      <div className="login__wrapper">
        <div className="login__container">
          <div className="login__box">
            <h2>ورود به پنل کاربری</h2>
            <form onSubmit={handleLogin}>
              <div className="login__input-group">
                <input
                  type="text"
                  id="username"
                  placeholder="نام کاربری"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="login__input-group">
                <input
                  type="password"
                  id="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login__btn">
                ورود
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
