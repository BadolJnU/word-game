import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../src/Pages/Home/Home";
import Login from "./Components/Login/Login";
import Signup from "./Components/SignUp/SignUp";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* This line ensures that if you go to '/', it sends you to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        
        {/* Catch-all route: if the user types a wrong URL, send them to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;