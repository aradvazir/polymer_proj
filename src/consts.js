// export const baseUrl = "/";
// export const baseUrl = "http://localhost:8000/";
// export const baseUrl = "https://37.255.233.131:4253/api/";
export const baseUrl = "https://172.16.87.18/api/"

export const translations = {
  allproducts: "همه محصولات",
  fittingproduct: "اتصالات",
  machines: "خطوط تولید",
  materials: "گروه محصولات",
  operators: "اپراتور‌ها",
  pipeproduct: "لوله‌ها",
  rawmaterials: "مواد اولیه",
  recipes: "دستور تولید",
  mixentries: "اطلاعات میکسر",
  // Add more translations as needed
};

export const translation_cols = {
  material: "نام محصول",
  weight: "وزن(کیلوگرم)",
  material_id: "آیدی محصول",
  rawmaterial_id: "آیدی ماده اولیه",
  type: "نوع",
  part: "بخش",
  major: "فعالیت",
  education: "تحصیلات",
  marriage: "تاهل",
  personal_id: "کد ملی",
  sex: "جنسیت",
  father: "پدر",
  name: "نام",
  company: "شرکت",
  rawmaterial: "نام ماده اولیه",
  price: "قیمت",
  active: "فعال",
  image: "تصویر",
  color: "رنگ",
  length: "طول",
  quality: "کیفیت",
  tickness: "ضخامت",
  size: "سایز",
  export: "صادراتی",
  usage: "مصرف",
  unit: "واحد",
  code: "کد",
  model: "مدل",
  entity: "محتوا",
  number_pallet: "تعداد پالت",
  number_box: "تعداد باکس",
  amount: "مقدار",
  category: "کتگوری",
  date: "تاریخ",
  time_start: "زمان شروع",
  time_end: "زمان پایان",
  recipe_code: "کد دستور تولید",
  description: "توضیح",
  product_id:"کد محصول",
  line_id: "کد خط",
  shift: "شیفت",
  operator_id:"آیدی اپراتور",
  machine: "نام دستگاه",
  confirm: "فعال",
  // Add more translations as needed
};

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

function arrayBufferToBase64(buffer) {
  const byteArray = new Uint8Array(buffer);
  let binaryString = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
      binaryString += String.fromCharCode(byteArray[i]);
  }
  return btoa(binaryString);
}

export function convertArrayBufferToBase64Text(arrayBuffer) {
  const base64String = arrayBufferToBase64(arrayBuffer);
  const dataUrl = `data:image/jpeg;base64,${base64String}`;
  return dataUrl;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function convertFarsiDigitsToEnglish(text) {
  // Mapping of Farsi digits to English digits
  const farsiToEnglishDigits = {
      '۰': '0',
      '۱': '1',
      '۲': '2',
      '۳': '3',
      '۴': '4',
      '۵': '5',
      '۶': '6',
      '۷': '7',
      '۸': '8',
      '۹': '9'
  };

  // Use a regular expression to replace Farsi digits with English digits
  return text.replace(/[۰-۹]/g, (match) => farsiToEnglishDigits[match]);
};
