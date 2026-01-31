import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
// Adjust path to your API file
import { useGetCurrentUserQuery } from "../features/authSlice/authApiSlice";
import {
  selectCurrentUser,
  setCredentials,
} from "../features/authSlice/authSlice";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // 1. Get initial auth state from Redux (likely from localStorage via initialState)
  const token = useSelector((state) => state.auth.token);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // 2. Verify token validity with backend
  const {
    data: userData, // Since we used transformResponse, this IS the user object
    isLoading,
    isError,
    isSuccess,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
    // This ensures we verify the token on page refresh or navigation
    refetchOnMountOrArgChange: true,
  });

  // 3. Sync latest user data to Redux slice
  useEffect(() => {
    // IMPORTANT: Check for userData directly, not userData.data
    if (isSuccess && userData) {
      dispatch(
        setCredentials({
          user: userData,
          token: token,
        }),
      );
    }
  }, [isSuccess, userData, token, dispatch]);

  // Case 1: No token found in storage
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: Waiting for backend verification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Case 3: Token was invalid (Backend rejected it)
  if (isError) {
    // Optional: Dispatch logout here to clear invalid token from localStorage
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 4: User is valid, but Role is not allowed
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Case 5: Authorized
  return <Outlet />;
};

export default ProtectedRoute;
