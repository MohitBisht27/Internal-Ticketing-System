import { useState, useEffect } from "react";
import { useLoginMutation } from "../features/authSlice/authApiSlice";
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

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
  const [login, { isLoading, isSuccess, reset }] = useLoginMutation();

  const [formData, setFormData] = useState(initialFormState);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setServerError("");
    setShowSuccess(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData).unwrap();
    } catch (err) {
      setServerError(err?.data?.message || "Invalid email or password");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setFormData(initialFormState);
      setShowPassword(false);
      setShowSuccess(true);

      const timer = setTimeout(() => {
        reset();
        setShowSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

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
        />

        <div className="text-right">
          <a
            href="/forgot-password"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Forgot password?
          </a>
        </div>

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
      </form>
    </AuthCard>
  );
};

export default SignIn;
