// export const baseUrl = "/";
// export const baseUrl = "http://localhost:8000/";
export const baseUrl = "/api/";

export const getCookie = (name) => {
  const nameEQ = name + "="; // Create a string to search for
  const ca = document.cookie.split(";"); // Split cookies into an array
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]; // Get each cookie
    while (c.charAt(0) === " ") c = c.substring(1, c.length); // Trim leading spaces
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length); // Return cookie value
  }
  return null; // Return null if cookie not found
};

export const setCookie = (name, value, mins = 60) => {
  let expires = "";
  const date = new Date();
  date.setTime(date.getTime() + mins * 60 * 1000);
  expires = "; expires=" + date.toUTCString();
  // Construct the cookie string
  let cookieString = `${name}=${value || ""}${expires}; path=/; SameSite=None;`;
  document.cookie = cookieString;
  cookieString = `${name}=${
    value || ""
  }${expires}; path=/; SameSite=None; Secure;`;
  document.cookie = cookieString;
};

export const TYPES = {
  "character varying": "string",
  integer: "number",
  boolean: "boolean",
  datetime: "string",
  "time without time zone": "string",
  date: "string",
};
