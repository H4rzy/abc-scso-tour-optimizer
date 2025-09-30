import axios from "axios";

const API_BASE = "http://localhost:3000/api";

/**
 * Đăng nhập -> lấy token
 */
export const login = async (email, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data; // { token: "..." }
};

/**
 * Upload dữ liệu và chạy Engine
 * @param {Object} data { Destinations:[], CostMatrix:[[]] }
 */
export const uploadAndRunTour = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa có token, hãy login trước");

  const res = await axios.post(`${API_BASE}/optimize/upload`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return res.data; 
  // { message, TourID, result }
};
