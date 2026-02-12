import { useState } from "react";
import { useLoginMutation } from "../features/authSlice/authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice/authSlice";
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import TextInput from "../components/auth/TextInput";
import PasswordInput from "../components/auth/PasswordInput";
import SubmitButton from "../components/auth/SubmitButton";
import Message from "../components/auth/Message";

const initialFormState = {
  email: "",
  password: "",
};

const SignIn = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(initialFormState);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect to the page user tried to access, or dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setServerError("");
    setShowSuccess(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    try {
      const result = await login(formData).unwrap();

      // Extract token and user from response
      const token =
        result?.data?.accessToken ||
        result?.data?.token ||
        result?.accessToken ||
        result?.token;
      const user = result?.data?.user || result?.user;

      if (token && user) {
        // Set credentials in Redux store
        dispatch(setCredentials({ user, token }));

        setShowSuccess(true);

        // Navigate after showing success message
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        setServerError("Login successful but authentication data is missing");
      }
    } catch (err) {
      setServerError(err?.data?.message || "Invalid email or password");
    }
  };

  return (
    <AuthCard
      icon={LogIn}
      title="Welcome Back"
      subtitle="Sign in to continue"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextInput
          icon={Mail}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          autoFocus
        />
        <PasswordInput
          icon={Lock}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          required
        />{" "}
        <SubmitButton
          loading={isLoading}
          text="Sign In"
          loadingText="Signing In..."
        />
        {serverError && (
          <Message icon={AlertCircle} type="error" text={serverError} />
        )}
        {showSuccess && (
          <Message
            icon={CheckCircle2}
            type="success"
            text="Login successful! Redirecting..."
          />
        )}
        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Register
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignIn;
