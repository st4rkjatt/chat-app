import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
// import axios from "axios";
const base_URL = "http://localhost:13000/api/v1/auth";

export const ForgetPasswordAction = createAsyncThunk(
  "ForgotPassword/FORGET_PASSWORD",
  async (form: any, { rejectWithValue }) => {
    try {
      const response = await fetch(base_URL + "/forget-password", {
        method: "POST",
        body: JSON.stringify({
          email: form,
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
export const VerifyOTPAction = createAsyncThunk(
  "ForgotPassword/VERIFY_OTP",
  async (form: any, { rejectWithValue }) => {
    try {
      const response = await fetch(base_URL + "/verify-otp", {
        method: "POST",
        body: JSON.stringify(form),
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
export const ResetPasswordAction = createAsyncThunk(
  "ForgotPassword/RESET_PASSWORD",
  async (form: any, { rejectWithValue }) => {
    try {
      const response = await fetch(base_URL + "/reset-password", {
        method: "POST",
        body: JSON.stringify(form),
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

const initialState = {
  loading: false,
  result: null,
  error: null,
  //   token: null,
};
const ForgotPasswordReducer = createSlice({
  name: "ForgetPassword",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // -----------------register===============================
    builder.addCase(ForgetPasswordAction.pending, (state) => {
      state.loading = true;
      state.error = null; // Reset error when starting the request
    });
    builder.addCase(ForgetPasswordAction.fulfilled, (state, action) => {
      console.log(action, "action");
      state.loading = false;
      state.result = action.payload;
      state.error = null;
      toast.success(action.payload.msg);
    });
    builder.addCase(ForgetPasswordAction.rejected, (state:any, action:any) => {
      console.log(action, "error");
      state.loading = false;
      state.error = (action.payload as string) || "Backend error occurred";
      toast.error(action.payload as string);
    });
    // -----------------register===============================
    builder.addCase(VerifyOTPAction.pending, (state) => {
      state.loading = true;
      state.error = null; // Reset error when starting the request
    });
    builder.addCase(VerifyOTPAction.fulfilled, (state, action) => {
      console.log(action, "action");
      state.loading = false;
      state.result = action.payload;
      state.error = null;
      toast.success(action.payload.msg);
    });
    builder.addCase(VerifyOTPAction.rejected, (state:any, action:any) => {
      console.log(action, "error");
      state.loading = false;
      state.error = (action.payload as string) || "Backend error occurred";
      toast.error(action.payload);
    });
    // -----------------reset password===============================
    builder.addCase(ResetPasswordAction.pending, (state) => {
      state.loading = true;
      state.error = null; // Reset error when starting the request
    });
    builder.addCase(ResetPasswordAction.fulfilled, (state, action) => {
      console.log(action, "action");
      state.loading = false;
      state.result = action.payload;
      state.error = null;
      toast.success(action.payload.msg);
    });
    builder.addCase(ResetPasswordAction.rejected, (state:any, action:any) => {
      console.log(action, "error");
      state.loading = false;
      state.error = (action.payload as string) || "Backend error occurred";
      toast.error(action.payload as string);
    });
  },
});

export default ForgotPasswordReducer.reducer;
