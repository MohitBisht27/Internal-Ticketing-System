import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRefreshMutation } from "../features/authSlice/authApiSlice";
import { selectCurrentToken } from "../features/authSlice/authSlice";
import { Loader2 } from "lucide-react";

const PersistLogin = () => {
  const token = useSelector(selectCurrentToken);
  const [refresh] = useRefreshMutation();

  // 1. Initialize state: If no token in memory, we are "checking"
  const [isCheckingAuth, setIsCheckingAuth] = useState(!token);

  useEffect(() => {
    // 2. Safety flag to prevent state updates if component unmounts
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        // console.log("Verifying Refresh Token...");
        await refresh().unwrap();
      } catch (err) {
        // console.error("Refresh failed:", err);
        // If refresh fails, we just let it fail.
        // isCheckingAuth will become false, rendering the Outlet.
        // The ProtectedRoute inside Outlet will then see no token and redirect to Login.
      } finally {
        // 3. Always turn off loading, success or fail
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    // 4. Logic Flow
    if (!token) {
      verifyRefreshToken();
    } else {
      setIsCheckingAuth(false);
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <--- Empty dependency array ensures this runs ONCE on mount

  // 5. Render Loading Spinner
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // 6. Render App
  return <Outlet />;
};

export default PersistLogin;
