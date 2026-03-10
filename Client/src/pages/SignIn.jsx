import { SignInForm } from "../components/Demo/SignInForm";
import { NavLink} from "react-router-dom";
import LoginScreen from "@/components/Demo/LoginScreen";



export default function SignIn() {
  
  return (
    <div className="h-screen w-screen flex flex-col  md:flex-row items-center justify-center text-white">

          <div className="w-full h-fit sm:w-2/3 sm:h-full z-50  sm:mt-0 sm:hidden block mb-20">
          <LoginScreen />
          </div>
      {/* Container for both sides of the screen */}
      <div className="w-full sm:w-1/2 flex flex-col items-center justify-center px-4 sm:px-0">
        {/* Title Section */}
        <h1 className="text-3xl font-medium tracking-wide mb-4 text-center sm:text-left">
          Signin to <strong className="text-blue-400">Converse</strong>
        </h1>
        
        {/* Sign-In Form Container */}
        <div className="w-full max-w-sm border-white/20 border px-8 py-6 rounded-xl backdrop-filter backdrop-blur-sm">

          <SignInForm />
          <p className="text-sm text-white/50 text-center mt-4">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-blue-400 hover:underline hover:text-white cursor-pointer"
            >
              Login
            </NavLink>
          </p>
        </div>
      </div>

      {/* 3D Animation or Image Section */}
     <div className="w-full h-1/3 sm:w-2/3 sm:h-full z-50  sm:mt-0 sm:block  hidden">
        <LoginScreen />
      </div>
    </div>
  );
}
