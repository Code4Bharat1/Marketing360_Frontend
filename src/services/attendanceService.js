import axios from "axios";

// ─── Axios instance ───────────────────────────────────────────────────────────
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const attendanceClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach auth token to every request
attendanceClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Unwrap response.data and handle 401
attendanceClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Request failed";

      if (
        error.response.status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/")
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/";
      }

      throw new Error(message);
    } else if (error.request) {
      throw new Error("Network error – please check your connection");
    } else {
      throw error;
    }
  }
);

// ─── Employee API calls ───────────────────────────────────────────────────────

/**
 * Punch in for today
 * @param {{ latitude?, longitude?, address?, photo?, notes? }} payload
 */
export const punchIn = async (payload = {}) => {
  try {
    return await attendanceClient.post("/attendance/punch-in", payload);
  } catch (error) {
    console.error("Punch-in error:", error);
    throw error;
  }
};

/**
 * Punch out for today
 * @param {{ latitude?, longitude?, address?, photo?, notes? }} payload
 */
export const punchOut = async (payload = {}) => {
  try {
    return await attendanceClient.patch("/attendance/punch-out", payload);
  } catch (error) {
    console.error("Punch-out error:", error);
    throw error;
  }
};

/**
 * Get today's attendance record
 * @returns {{ data: AttendanceRecord | null }}
 */
export const getTodayAttendance = async () => {
  try {
    return await attendanceClient.get("/attendance/today");
  } catch (error) {
    console.error("Get today attendance error:", error);
    throw error;
  }
};

/**
 * Get monthly summary
 * @param {number} month  1–12
 * @param {number} year   e.g. 2024
 */
export const getMonthlySummary = async (month, year) => {
  try {
    return await attendanceClient.get("/attendance/monthly-summary", {
      params: { month, year },
    });
  } catch (error) {
    console.error("Monthly summary error:", error);
    throw error;
  }
};

/**
 * Get my attendance records with optional filters
 * @param {{ startDate?, endDate?, status? }} filters
 */
export const getMyAttendanceRecords = async (filters = {}) => {
  try {
    return await attendanceClient.get("/attendance/my-records", {
      params: filters,
    });
  } catch (error) {
    console.error("Get my records error:", error);
    throw error;
  }
};

// ─── Admin API calls ──────────────────────────────────────────────────────────

/**
 * Get all attendance records (admin/manager)
 * @param {{ userId?, startDate?, endDate?, status? }} filters
 */
export const getAllAttendanceRecords = async (filters = {}) => {
  try {
    return await attendanceClient.get("/attendance/all", { params: filters });
  } catch (error) {
    console.error("Get all records error:", error);
    throw error;
  }
};

/**
 * Get team monthly summary (admin/manager)
 * @param {number} month
 * @param {number} year
 */
export const getTeamMonthlySummary = async (month, year) => {
  try {
    return await attendanceClient.get("/attendance/team-summary", {
      params: { month, year },
    });
  } catch (error) {
    console.error("Team summary error:", error);
    throw error;
  }
};

export { attendanceClient };

export default {
  punchIn,
  punchOut,
  getTodayAttendance,
  getMonthlySummary,
  getMyAttendanceRecords,
  getAllAttendanceRecords,
  getTeamMonthlySummary,
};