import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRefreshMutation } from "../features/authSlice/authApiSlice";
import { selectCurrentToken } from "../features/authSlice/authSlice";
import { Loader2 } from "lucide-react";

const PersistLogin = () => {
  const token = useSelector(selectCurrentToken);
  const [trueSuccess, setTrueSuccess] = useState(false);

  // We only care if it initializes or loads
  const [refresh, { isLoading, isUninitialized }] = useRefreshMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      //   console.log("PersistLogin: Checking for token...");
      try {
        // .unwrap() throws an error if the request fails, allowing catch block to run
        const result = await refresh().unwrap();
        // console.log("PersistLogin: Refresh Success");
        setTrueSuccess(true);
      } catch (err) {
        console.error("PersistLogin: Refresh Failed", err);
      }
    };

    if (!token) {
      verifyRefreshToken();
    } else {
      setTrueSuccess(true);
    }
  }, [token, refresh]);

  // If we are currently fetching the token, show a spinner
  // This prevents the "No Token" error in child components
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Once loading is done, we render the app
  // ProtectedRoute will handle redirecting if token is still null
  return <Outlet />;
};

export default PersistLogin;
