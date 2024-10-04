import React, { useEffect, useState } from 'react';
import './Login.css';
import logo from './golsar.png';
import { useNavigate } from 'react-router-dom';
import { baseUrl, setCookie, getCookie } from './consts';

const Login = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const token = getCookie("token");
  useEffect(() => {
    if(token){
      navigate("/menu");
    }
  })
  

  const handleLogin = async(e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Username:', username);
    console.log('Password:', password);
    // const body = new FormData();
    // body.append("username", username);
    // body.append("password", password);
    const body = new URLSearchParams({ // Encode the form data
      username,
      password,
    })
    console.log(body);

    const login_resp = await fetch(baseUrl + "token", {
      method: "POST",
      body: body,
      headers: {
        "Content-type": "application/x-www-form-urlencoded"
      }
    });
    const login_json = await login_resp.json();
    console.log(login_resp);
    console.log(login_json);
    if(login_resp.ok){
      setCookie("token", login_json.access_token, 6000000);
      setCookie("role", login_json.role, 6000000);
      navigate("/menu")
      
    }else if(login_resp.status === 401){
      window.alert("نام کاربری یا رمز اشتباه است")
    }
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
