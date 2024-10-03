import React, { useState } from 'react';
import './Login.css';
import logo from './logo.jpg'; // Ensure the logo is in the 'src' folder

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
    <div>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="login-logo" />
      </div>
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-box">
            <h2>ورود</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="text"
                  id="username"
                  placeholder="نام کاربری"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  id="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-btn">
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