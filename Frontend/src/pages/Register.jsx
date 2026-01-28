import { useState, useEffect, useRef } from "react";
import { useRegisterMutation } from "../features/authSlice/authApiSlice";
import {
  User,
  Mail,
  Lock,
  Building2,
  Briefcase,
  AtSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import AuthCard from "../components/auth/AuthCard";
import TextInput from "../components/auth/TextInput";
import PasswordInput from "../components/auth/PasswordInput";
import SelectInput from "../components/auth/SelectInput";
import FileUpload from "../components/auth/FileUpload";
import SubmitButton from "../components/auth/SubmitButton";
import Message from "../components/auth/Message";

const initialFormState = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  department: "",
  role: "employee",
};

const Register = () => {
  const [register, { isLoading, isSuccess, reset }] = useRegisterMutation();

  const [formData, setFormData] = useState(initialFormState);
  const [avatar, setAvatar] = useState(null);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileRef = useRef(null);

  const handleChange = (e) => {
    setServerError("");
    setShowSuccess(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setServerError("");
    setShowSuccess(false);
    if (e.target.files[0]) setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      setServerError("Please upload a profile picture.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("avatar", avatar);

    try {
      await register(data).unwrap();
    } catch (err) {
      setServerError(err?.data?.message || "User already exists");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setFormData(initialFormState);
      setAvatar(null);
      setShowPassword(false);
      setServerError("");
      setShowSuccess(true);
      fileRef.current.value = "";

      const timer = setTimeout(() => {
        reset();
        setShowSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  return (
    <AuthCard
      icon={User}
      title="Create Account"
      subtitle="Join our workspace today"
      maxWidth="max-w-lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        encType="multipart/form-data"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput
            icon={User}
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <TextInput
            icon={AtSign}
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <TextInput
          icon={Mail}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
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

        <div className="grid md:grid-cols-2 gap-4">
          <SelectInput
            icon={Building2}
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Department
            </option>
            <option>Engineering</option>
            <option>HR</option>
            <option>Finance</option>
            <option>IT</option>
            <option>Operations</option>
          </SelectInput>

          <SelectInput
            icon={Briefcase}
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </SelectInput>
        </div>

        <FileUpload
          file={avatar}
          onChange={handleFileChange}
          inputRef={fileRef}
        />

        <SubmitButton
          loading={isLoading}
          text="Register Now"
          loadingText="Creating Account..."
        />

        {serverError && (
          <Message icon={AlertCircle} type="error" text={serverError} />
        )}

        {showSuccess && (
          <Message
            icon={CheckCircle2}
            type="success"
            text="Registration successful! Welcome aboard."
          />
        )}
      </form>
    </AuthCard>
  );
};

export default Register;
