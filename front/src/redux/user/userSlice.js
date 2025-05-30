// src/store/user/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Detect if current path is admin
const isAdminPath = window.location.pathname.startsWith("/admin");

// Load correct user session based on page context
const storedUser = localStorage.getItem(isAdminPath ? "admin" : "user");
const initialUser = storedUser
  ? JSON.parse(storedUser)
  : {
      id: null,
      username: "Guest",
      avatar: "",
      email: "guest@example.com",
      role: null,
    };

const initialState = {
  currentUser: initialUser,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setAdminUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem("admin", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.currentUser = {
        id: null,
        username: "Guest",
        avatar: "",
        email: "guest@example.com",
        role: null,
      };
      localStorage.removeItem("user"); // ✅ only remove user
    },
    logoutAdmin: (state) => {
      state.currentUser = {
        id: null,
        username: "Guest",
        avatar: "",
        email: "guest@example.com",
        role: null,
      };
      localStorage.removeItem("admin"); // ✅ only remove admin
    },
  },
});

export const { setUser, setAdminUser, logoutUser, logoutAdmin } = userSlice.actions;
export default userSlice.reducer;
