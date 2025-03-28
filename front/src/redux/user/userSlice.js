import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: { username: "Guest", avatar: "", email: "guest@example.com" },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
