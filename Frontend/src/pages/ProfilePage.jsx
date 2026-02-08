import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  useGetCurrentUserQuery,
  useUpdateAvatarMutation,
} from "../features/authSlice/authApiSlice";
import {
  User,
  Mail,
  Building2,
  Shield,
  Calendar,
  Camera,
  Loader2,
  XCircle,
} from "lucide-react";

const ProfilePage = () => {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const {
    data: queryUser,
    isLoading,
    isError,
  } = useGetCurrentUserQuery(undefined, {
    // Ensure we always get fresh data when component mounts
    refetchOnMountOrArgChange: true,
  });

  // Prioritize query data, fallback to redux
  const user = queryUser || reduxUser;

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const [updateAvatar, { isLoading: isUploadingAvatar }] =
    useUpdateAvatarMutation();

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setUploadError(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    // Show immediate preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      // Upload and wait for result
      const result = await updateAvatar(formData).unwrap();
      console.log("Avatar update result:", result); // Debug log

      // Clear preview - the real URL is now in state
      setAvatarPreview(null);
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setUploadError(err?.data?.message || "Failed to upload avatar");
      // Revert preview on error
      setAvatarPreview(null);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Compute the avatar URL with cache-busting
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar?.url) {
      // Add timestamp to bust browser cache
      return `${user.avatar.url}?t=${Date.now()}`;
    }
    return "https://secure.gravatar.com/avatar/";
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="text-lg font-semibold text-red-800">
            Failed to load profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={getAvatarUrl()}
                alt={user.fullName}
                key={user.avatar?.public_id || user.avatar?.url || "default"}
                className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.src = "https://secure.gravatar.com/avatar/";
                }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-2 text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />

              <span
                className={`absolute right-1 top-1 h-4 w-4 rounded-full border-2 border-white ${
                  user.isActive ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.fullName}
              </h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
              {uploadError && (
                <p className="mt-1 text-xs text-red-500">{uploadError}</p>
              )}
              <span
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.role === "admin"
                    ? "bg-red-100 text-red-700"
                    : user.role === "agent"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                <Shield className="h-3 w-3" />
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          <div className="space-y-4">
            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow
              icon={Building2}
              label="Department"
              value={user.department}
            />
            <DetailRow
              icon={User}
              label="Username"
              value={`@${user.username}`}
            />
            <DetailRow
              icon={Calendar}
              label="Joined"
              value={formatDate(user.createdAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
      <Icon className="h-5 w-5 text-gray-500" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "N/A"}</p>
    </div>
  </div>
);

export default ProfilePage;
