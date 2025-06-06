import { Routes, Route, Navigate,useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, connectSocket } from "./redux/slice/authSlice";
import { ProgressDemo } from "./components/Demo/ProgressDemo";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import UpdateProfile from "./pages/UpdateProfile";
import Layout from "./components/ui/Layout";
import { SparklesCore } from "@/components/ui/sparkles";
import { Toaster } from "@/components/ui/toaster";
import Logout from "./pages/Logout";
import Aurora from "@/components/ui/Backgrounds/Aurora/Aurora";
import OutgoingCall from "./pages/OutgoingCall";
import IncomingCall from "./pages/IncomingCall";

export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authUser, isCheckingUser,onlineUsers } = useSelector((state) => state.auth);

  useEffect(() => {
    if(!isCheckingUser)
    dispatch(checkAuth(navigate));  
  setTimeout(() => {
    dispatch(connectSocket(navigate));
  }, 3000);
  }, [dispatch]);



  if (isCheckingUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <ProgressDemo />
      </div>
    );
  }

  return (
    <div>
      <div className="w-screen absolute inset-0 h-screen -z-50">
      <SparklesCore
          id="tsparticlesfullpage"
          background="#000000"
          minSize={0.1}
          maxSize={0.7}
          particleDensity={70}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
                
      </div>
      <div className="w-screen absolute inset-0 h-1/2 -z-50">
      <Aurora
        colorStops={["#00d8ff", "#7cff67", "#00d8ff"]}
        blend={1}
        amplitude={2}
        speed={0.3}
      />
                
      </div>
      
      <Toaster />
      <Routes>
        <Route element={ authUser?<Layout />:<Navigate to="/login" /> }>
          {/* Protected Routes */}
          <Route
            path="/"
            element={ <Home/>}
          />
          <Route
            path="/update-profile"
            element={ <UpdateProfile /> }
          />
          <Route 
            path="/settings"
            element={ <div>Settings</div> }
          />
          <Route 
            path="/logout"
            element={ <Logout/> }
          />
          <Route 
            path="/outgoingCall/:id"
            element={ <OutgoingCall/> }
          />
          <Route 
            path="/incomingCall/:id"
            element={ <IncomingCall/> }
          />
        
          <Route
            path="*"
            element={<div>404 Not Found</div>}
          />
        </Route>
        {/* Public Routes */}
        <Route
          path="/login"
          element={authUser ? <Navigate replace to="/" /> : <Login />}
        />
        <Route
          path="/signin"
          element={authUser ? <Navigate replace to="/" /> : <SignIn />}
        />
      </Routes>
    </div>
  );
}
