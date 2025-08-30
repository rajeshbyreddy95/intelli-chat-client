import axios from "axios";

// ✅ Central backend URL
const BACKEND_URL = "https://intelli-chat-server.onrender.com";  

// ✅ Axios instance
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 60000, // 60s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export default api