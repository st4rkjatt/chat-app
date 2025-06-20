import { configureStore } from "@reduxjs/toolkit";
import UserRegisterApi from "./Reducers/Auth.tsx/UserLoginSlice";
import ForgotPasswordReducer from "./Reducers/Auth.tsx/ForgetPasswordSlice";
import usersReducers from "./Reducers/Auth.tsx/UsersSlice"
export const store = configureStore({
  reducer: {
    userAuth: UserRegisterApi,
    forgotPasswordReducer: ForgotPasswordReducer,
    usersReducers:usersReducers
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
