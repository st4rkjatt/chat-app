import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Screen/Auth/Login";
import Registration from "./Screen/Auth/Registration";
import ForgetPassword from "./Screen/Auth/ForgetPassword";
import Dashboard from "./Screen/Auth/Dashboard";
import { isTokenValid } from "./General/TokenValidation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfile from "./Screen/UserProfile";

// toast.configure();
const ProtectedRoute = ({ children }: any) => {
  if (!isTokenValid()) {
    // If the token is not valid, show a toast and redirect to the login page
    toast.error("Your token has been expired. Please login again.");
    return <Navigate to="/" replace />;
  }
  return children;
};
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;