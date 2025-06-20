import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
// import axios from "axios";
const base_URL = "http://localhost:8000/api/v1/auth";
export const UserRegisterApi = createAsyncThunk(
  "User/UserRegister",
  async (form: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`${base_URL}/register`, {
        // const response = await fetch(base_URL + "/register", {
        method: "POST",
        body: JSON.stringify({
          userName: form.userName,
          email: form.email,
          // username: form.email,
          password: form.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resJson = await response.json();

      if (!response.ok) {
        const errorMessage = resJson && resJson.message;
        if (errorMessage) {
          throw new Error(errorMessage);
        }
      }

      return resJson;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const userLoginApi = createAsyncThunk(
  "User/UserLogin",
  async (form: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/auth/login`, {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          // username: form.email,
          password: form.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resJson = await response.json();
        console.log(resJson, "responseError");
      if (!response.ok) {
        const errorMessage = resJson && resJson.message;
        if (errorMessage) {
          throw new Error(errorMessage);
        }
      }

      return resJson.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const userLoginByGoogleApi = createAsyncThunk(
  "User/UserLoginByGoogle",
  async (_, { rejectWithValue }) => {
    try {
      // const response = await fetch(base_URL + "/login", {
      const response = await fetch('http://localhost:13000/auth/status', {
        credentials: 'include', // Ensure cookies are sent
      });


      const resJson = await response.json();
      //   console.log(resJson, "responseError");
      if (!response.ok) {
        const errorMessage = resJson && resJson.message;
        if (errorMessage) {
          throw new Error(errorMessage);
        }
      }

      return resJson;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);



const initialState = {
  loading: false,
  result: null,
  error: null,
  //   token: null,
};

const UserRegister = createSlice({
  name: "UserRegister",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // -----------------register===============================
    builder.addCase(UserRegisterApi.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(UserRegisterApi.fulfilled, (state, action) => {
      console.log(action, "action sign up");
      state.loading = false;
      state.result = action.payload;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("token", action.payload.token);
      toast.success(action.payload.msg);
    });
    builder.addCase(UserRegisterApi.rejected, (state: any, action: any) => {
      console.log(action, "error action sign up");
      state.loading = false;
      state.error = (action.payload as string) || "Backend error occurred";
      toast.error(action.payload);
    });
    // --------------------------------Login---------------------------
    builder.addCase(userLoginApi.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(userLoginApi.fulfilled, (state, action) => {
      console.log(action, "actions");
      state.loading = false;
      state.result = action.payload;
      state.error = null;

      localStorage.setItem("user", JSON.stringify(action.payload));
      // localStorage.setItem("user", JSON.stringify(action.payload.data));
      localStorage.setItem("token", action.payload.token)
      toast.success(action.payload.msg);
    });
    builder.addCase(userLoginApi.rejected, (state: any, action: any) => {
      console.log(action, "error");
      state.loading = false;
      state.error = action.error.message; // Store the error message
      state.result = null;
      toast.error(action.payload);
    });
    // --------------------------------Google Login---------------------------
    builder.addCase(userLoginByGoogleApi.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(userLoginByGoogleApi.fulfilled, (state, action) => {
      console.log(action, "actions");
      state.loading = false;
      state.result = action.payload;
      state.error = null;

      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.user.token)
      toast.success(action.payload.msg);
      alert('j')
    });
    builder.addCase(userLoginByGoogleApi.rejected, (state: any, action: any) => {
      console.log(action, "error");
      state.loading = false;
      state.error = action.error.message; // Store the error message
      state.result = null;
      toast.error(action.payload);
    });
  },
});

export default UserRegister.reducer;
