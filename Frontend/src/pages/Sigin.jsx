import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../features/auth/authApiSlice";
import { setCredentials } from "../features/auth/authSlice";

import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import PasswordField from "../components/ui/PasswordField";
import SubmitButton from "../components/ui/SubmitButton";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [login, { isLoading, isSuccess, error }] = useLoginMutation();

  // Get redirect path from location state (if user was redirected here)
  const from = location.state?.from?.pathname || "/dashboard";

  // Form inputs
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});
  const [mainError, setMainError] = useState("");

  // Success message (e.g., after registration)
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle login errors
  useEffect(() => {
    if (error) {
      const errorData = error.data;

      if (typeof errorData === "string" && errorData.includes("<html")) {
        const errorText = errorData.toLowerCase();

        if (errorText.includes("invalid") || errorText.includes("incorrect")) {
          setMainError("Invalid email/username or password");
        } else if (errorText.includes("not found")) {
          setMainError("Account not found. Please check your credentials.");
        } else {
          setMainError("Something went wrong. Please try again.");
        }
      } else if (errorData?.message) {
        setMainError(errorData.message);
      } else if (errorData?.error) {
        setMainError(errorData.error);
      } else {
        setMainError("Login failed. Please check your credentials.");
      }
    }
  }, [error]);

  // Redirect after successful login
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => navigate(from, { replace: true }), 500);
    }
  }, [isSuccess, navigate, from]);

  // Validate form before submitting
  const validate = () => {
    const newErrors = {};

    // Check email/username
    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }

    // Check password
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMainError("");
    setErrors({});
    setSuccessMessage("");

    // Validate all fields
    if (!validate()) return;

    // Determine if input is email or username
    const isEmail = emailOrUsername.includes("@");

    const credentials = {
      password,
      ...(isEmail
        ? { email: emailOrUsername.trim().toLowerCase() }
        : { username: emailOrUsername.trim() }),
    };

    try {
      const result = await login(credentials).unwrap();

      // Store credentials in Redux
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      );
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Success Message (e.g., after registration) */}
        {successMessage && <Alert type="success" message={successMessage} />}

        {/* Error Message */}
        {mainError && <Alert type="error" message={mainError} />}

        {/* Success Message after login */}
        {isSuccess && (
          <Alert type="success" message="Login successful! Redirecting..." />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Username */}
          <FormField
            label="Email or Username"
            name="emailOrUsername"
            type="text"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setErrors({ ...errors, emailOrUsername: "" });
              setMainError("");
            }}
            placeholder="Enter your email or username"
            error={errors.emailOrUsername}
            disabled={isLoading || isSuccess}
            autoComplete="username"
          />

          {/* Password */}
          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "" });
              setMainError("");
            }}
            placeholder="Enter your password"
            error={errors.password}
            disabled={isLoading || isSuccess}
            autoComplete="current-password"
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isSuccess}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <SubmitButton
            isLoading={isLoading}
            isSuccess={isSuccess}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? "Signing in..." : isSuccess ? "Success!" : "Sign In"}
          </SubmitButton>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-4 text-center">
            <Link
              to="/register"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
