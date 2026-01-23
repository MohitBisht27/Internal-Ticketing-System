import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterMutation } from "../features/auth/authApiSlice";

import Alert from "../components/ui/Alert";
import FormField from "../components/ui/FormField";
import PasswordField from "../components/ui/PasswordField";
import SelectField from "../components/ui/SelectField";
import AvatarUpload from "../components/ui/AvatarUpload";
import SubmitButton from "../components/ui/SubmitButton";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Customer Success",
  "Operations",
  "IT",
];

const ROLES = [
  { value: "agent", label: "Support Agent" },
  { value: "admin", label: "Administrator" },
  { value: "employee", label: "Employee" },
];

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [register, { isLoading, isSuccess, error }] = useRegisterMutation();

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("agent");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Errors
  const [errors, setErrors] = useState({});
  const [mainError, setMainError] = useState("");

  // Show avatar preview when user selects a file
  useEffect(() => {
    if (avatar) {
      const url = URL.createObjectURL(avatar);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAvatarPreview(null);
    }
  }, [avatar]);

  // Redirect to login after successful registration
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (error) {
      const errorData = error.data;

      if (typeof errorData === "string" && errorData.includes("<html")) {
        const errorText = errorData.toLowerCase();

        if (errorText.includes("email") && errorText.includes("exist")) {
          setErrors({ email: "This email is already registered" });
          setMainError("Email already exists. Try a different email.");
        } else if (
          errorText.includes("username") &&
          errorText.includes("exist")
        ) {
          setErrors({ username: "This username is already taken" });
          setMainError("Username already exists. Try a different username.");
        } else {
          setMainError("Something went wrong. Please try again.");
        }
      } else if (errorData?.email || errorData?.username) {
        const newErrors = {};
        if (errorData.email) {
          newErrors.email = "This email is already registered";
        }
        if (errorData.username) {
          newErrors.username = "This username is already taken";
        }
        setErrors(newErrors);
        setMainError("Email or username already exists.");
      } else {
        setMainError("Registration failed. Please try again.");
      }
    }
  }, [error]);

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, avatar: "Please upload a valid image file" });
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, avatar: "Image must be less than 5MB" });
      return;
    }

    setAvatar(file);
    setErrors({ ...errors, avatar: "" });
  };

  // Remove avatar
  const removeAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form before submitting
  const validate = () => {
    const newErrors = {};

    // Check full name
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Check email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    // Check username
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      newErrors.username =
        "Username: 3-20 characters, letters/numbers/underscore only";
    }

    // Check password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Check department
    if (!department) {
      newErrors.department = "Please select a department";
    }

    // Check avatar
    if (!avatar) {
      newErrors.avatar = "Please upload a profile picture";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMainError("");
    setErrors({});

    // Validate all fields
    if (!validate()) return;

    // Create form data for API
    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("email", email.trim().toLowerCase());
    formData.append("username", username.trim());
    formData.append("password", password);
    formData.append("department", department);
    formData.append("role", role);
    formData.append("avatar", avatar);

    try {
      await register(formData).unwrap();
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Register New Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Error/Success Messages */}
        {mainError && <Alert type="error" message={mainError} />}
        {isSuccess && (
          <Alert
            type="success"
            message="Registration successful! Redirecting..."
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <AvatarUpload
            avatar={avatar}
            avatarPreview={avatarPreview}
            onChange={handleAvatarChange}
            onRemove={removeAvatar}
            error={errors.avatar}
            ref={fileInputRef}
            disabled={isLoading || isSuccess}
          />

          {/* Full Name */}
          <FormField
            label="Full Name"
            name="fullName"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors({ ...errors, fullName: "" });
            }}
            placeholder="Enter your full name"
            error={errors.fullName}
            disabled={isLoading || isSuccess}
          />

          {/* Email */}
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "" });
              setMainError("");
            }}
            placeholder="you@company.com"
            error={errors.email}
            disabled={isLoading || isSuccess}
          />

          {/* Username */}
          <FormField
            label="Username"
            name="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors({ ...errors, username: "" });
              setMainError("");
            }}
            placeholder="Choose a username"
            error={errors.username}
            disabled={isLoading || isSuccess}
          />

          {/* Password */}
          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "" });
            }}
            placeholder="At least 6 characters"
            error={errors.password}
            disabled={isLoading || isSuccess}
          />

          {/* Department */}
          <SelectField
            label="Department"
            name="department"
            options={DEPARTMENTS}
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setErrors({ ...errors, department: "" });
            }}
            placeholder="Select department"
            error={errors.department}
            disabled={isLoading || isSuccess}
          />

          {/* Role */}
          <SelectField
            label="Role"
            name="role"
            options={ROLES}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading || isSuccess}
          />

          {/* Submit Button */}
          <SubmitButton
            isLoading={isLoading}
            isSuccess={isSuccess}
            disabled={isLoading || isSuccess}
          >
            {isLoading
              ? "Creating Account..."
              : isSuccess
                ? "Success!"
                : "Create Account"}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};

export default Register;
