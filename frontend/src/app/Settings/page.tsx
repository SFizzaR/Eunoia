"use client";

import { useState, useEffect } from "react";
import { useTokenExpiration } from "../../../hooks/useTokenExpiration";
import { logout } from "../../lib/auth";

interface SettingsState {
  firstName: string;
  lastName: string;
  email: string;
  showPasswordChange: boolean;
  showDeleteConfirm: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordChangeSuccess: boolean;
  profileSaveSuccess: boolean;
  passwordChangeError: string;
  profileSaveError: string;
  isLoaded: boolean;
  deleteConfirmChecked: boolean;
  deleteFailError: string;
}

export default function Settings() {
  useTokenExpiration();
  const token = localStorage.getItem("token");
  const [state, setState] = useState<SettingsState>({
    firstName: "",
    lastName: "",
    email: "",
    showPasswordChange: false,
    showDeleteConfirm: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    passwordChangeSuccess: false,
    profileSaveSuccess: false,
    passwordChangeError: "",
    profileSaveError: "",
    isLoaded: false,
    deleteConfirmChecked: false,
    deleteFailError: "",
  });

  useEffect(() => {
    try {
      const userJSON = localStorage.getItem("user");
      if (userJSON) {
        const user = JSON.parse(userJSON);
        setState((prev) => ({
          ...prev,
          firstName: user.firstname || "",
          lastName: user.lastname || "",
          email: user.email || "",
          isLoaded: true,
        }));
      } else {
        setState((prev) => ({ ...prev, isLoaded: true }));
      }
    } catch (error) {
      console.error("Error loading user data: ", error);
      setState((prev) => ({ ...prev, isLoaded: true }));
    }
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!state.firstName.trim() || !state.lastName.trim()) {
        setState((prev) => ({
          ...prev,
          profileSaveError: "First and last name are required",
        }));
        return;
      }

      const res = await fetch("http://localhost:3000/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstname: state.firstName,
          lastname: state.lastName,
        }),
      });
      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();

      // Show profile success (not password success!)
      setState((prev) => ({
        ...prev,
        profileSaveSuccess: true,
        profileSaveError: "",
        firstName: data.firstname,
        lastName: data.lastname,
      }));
      localStorage.setItem("user", JSON.stringify(data));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          profileSaveSuccess: false,
        }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        profileSaveError:
          error instanceof Error ? error.message : "Failed to save profile",
      }));
    }
  };
  const handlePasswordChange = async () => {
    try {
      setState((prev) => ({ ...prev, passwordChangeError: "" }));

      if (
        !state.currentPassword ||
        !state.newPassword ||
        !state.confirmPassword
      ) {
        setState((prev) => ({
          ...prev,
          passwordChangeError: "All fields are required",
        }));
        return;
      }

      if (state.newPassword !== state.confirmPassword) {
        setState((prev) => ({
          ...prev,
          passwordChangeError: "New passwords do not match",
        }));
        return;
      }

      if (state.newPassword.length < 8) {
        setState((prev) => ({
          ...prev,
          passwordChangeError: "Password must be at least 8 characters",
        }));
        return;
      }

      const res = await fetch("http://localhost:3000/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: state.newPassword,
        }),
      });
      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to change password");
      }

      setState((prev) => ({
        ...prev,
        passwordChangeSuccess: true,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showPasswordChange: false,
        passwordChangeError: "", // ← Clear error on success
      }));

      // Hide success message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          passwordChangeSuccess: false,
        }));
      }, 3000);
    } catch (error) {
      // ✅ ADD THIS - don't leave catch empty!
      console.error("Password change error:", error);
      setState((prev) => ({
        ...prev,
        passwordChangeError:
          error instanceof Error ? error.message : "Failed to change password",
        passwordChangeSuccess: false, // ← Make sure this is false on error
      }));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmCheckbox = document.getElementById(
        "confirm-delete",
      ) as HTMLInputElement;
      if (!confirmCheckbox?.checked) {
        setState((prev) => ({
          ...prev,
          profileSaveError: "Please confirm you understand this is permanent",
        }));
        return;
      }

      const res = await fetch("http://localhost:3000/users", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      const deletedUser = await res.json(); // ← Get the response

      if (!deletedUser) {
        setState((prev) => ({
          ...prev,
          deleteFailError: "Failed to delete account",
        }));
        return;
      }

      // ✅ ONLY logout on SUCCESS
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Delete account error:", error);
      setState((prev) => ({
        ...prev,
        deleteFailError:
          error instanceof Error ? error.message : "Failed to delete account",
      }));
    }
  };

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#fafafa" }}
    >
      {/* HEADER */}
      <div
        className="w-full px-4 md:px-8 lg:px-16 py-12"
        style={{
          borderBottom: "2px solid #F9C5C7",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-4xl md:text-5xl font-bold transition-all duration-700 ${
              state.isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#1a1a1a",
            }}
          >
            Settings
          </h1>
          <p
            className="text-gray-600 mt-2"
            style={{
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* SUCCESS MESSAGE */}
          {state.passwordChangeSuccess && (
            <div
              className={`p-4 rounded-lg transition-all duration-300 ${
                state.passwordChangeSuccess ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundColor: "#f0fdf4",
                border: "2px solid #86efac",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{
                  color: "#16a34a",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ✓ Password changed successfully
              </p>
            </div>
          )}
          {state.profileSaveSuccess && (
            <div
              className={`p-4 rounded-lg transition-all duration-300 ${
                state.profileSaveSuccess ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundColor: "#f0fdf4",
                border: "2px solid #86efac",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{
                  color: "#16a34a",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ✓ Profile updated successfully
              </p>
            </div>
          )}

          {/* PROFILE SECTION */}
          <div
            className={`p-8 rounded-2xl transition-all duration-700 ${
              state.isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            style={{
              backgroundColor: "#FFF",
              border: "2px solid #F9C5C7",
              boxShadow: "0 8px 32px rgba(247, 130, 169, 0.1)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1a1a1a",
              }}
            >
              Account Information
            </h2>

            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{
                    color: "#1a1a1a",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={state.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    borderColor: "#F9C5C7",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f782a9")}
                  onBlur={(e) => (e.target.style.borderColor = "#F9C5C7")}
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{
                    color: "#1a1a1a",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={state.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    borderColor: "#F9C5C7",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f782a9")}
                  onBlur={(e) => (e.target.style.borderColor = "#F9C5C7")}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{
                    color: "#1a1a1a",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={state.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{
                    borderColor: "#E5E5E5",
                    backgroundColor: "#f9f9f9",
                    color: "#999",
                    fontFamily: "'Poppins', sans-serif",
                    cursor: "not-allowed",
                  }}
                />
                <p
                  className="text-xs mt-2"
                  style={{
                    color: "#999",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Email cannot be changed
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                className="mt-8 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #F9C5C7 0%, #f782a9 100%)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* SECURITY SECTION */}
          <div
            className={`p-8 rounded-2xl transition-all duration-700 ${
              state.isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            style={{
              backgroundColor: "#FFF",
              border: "2px solid #F9C5C7",
              boxShadow: "0 8px 32px rgba(247, 130, 169, 0.1)",
              transitionDelay: "100ms",
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1a1a1a",
              }}
            >
              Security
            </h2>

            {!state.showPasswordChange ? (
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, showPasswordChange: true }))
                }
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #F9C5C7 0%, #f782a9 100%)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: "#1a1a1a",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={state.currentPassword}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      borderColor: "#F9C5C7",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#f782a9")}
                    onBlur={(e) => (e.target.style.borderColor = "#F9C5C7")}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: "#1a1a1a",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={state.newPassword}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      borderColor: "#F9C5C7",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#f782a9")}
                    onBlur={(e) => (e.target.style.borderColor = "#F9C5C7")}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{
                      color: "#1a1a1a",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={state.confirmPassword}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      borderColor: "#F9C5C7",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#f782a9")}
                    onBlur={(e) => (e.target.style.borderColor = "#F9C5C7")}
                  />
                </div>

                {/* Error Message */}
                {state.passwordChangeError && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "2px solid #fca5a5",
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: "#dc2626",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {state.passwordChangeError}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #F9C5C7 0%, #f782a9 100%)",
                      color: "white",
                      fontFamily: "'Poppins', sans-serif",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        showPasswordChange: false,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                        passwordChangeError: "",
                      }))
                    }
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: "#f9f9f9",
                      color: "#1a1a1a",
                      fontFamily: "'Poppins', sans-serif",
                      border: "2px solid #ddd",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DANGER ZONE */}
          <div
            className={`p-8 rounded-2xl transition-all duration-700 ${
              state.isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            style={{
              backgroundColor: "#FFF",
              border: "2px solid #fee2e2",
              boxShadow: "0 8px 32px rgba(220, 38, 38, 0.08)",
              transitionDelay: "200ms",
            }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#dc2626",
              }}
            >
              Danger Zone
            </h2>
            <p
              className="text-sm mb-6"
              style={{
                color: "#999",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              This action cannot be undone
            </p>

            {!state.showDeleteConfirm ? (
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, showDeleteConfirm: true }))
                }
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete Account
              </button>
            ) : (
              <div>
                <div
                  className="p-4 rounded-lg mb-6"
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "2px solid #fca5a5",
                  }}
                >
                  <p
                    className="text-sm font-medium mb-4"
                    style={{
                      color: "#dc2626",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    ⚠️ Are you absolutely sure? This will permanently delete
                    your account and all journal entries. This action cannot be
                    reversed.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="confirm-delete"
                      checked={state.deleteConfirmChecked}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          deleteConfirmChecked: e.target.checked,
                        }))
                      }
                      style={{
                        cursor: "pointer",
                        width: "18px",
                        height: "18px",
                      }}
                    />
                    <label
                      htmlFor="confirm-delete"
                      style={{
                        color: "#666",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      I understand this is permanent
                    </label>
                  </div>
                </div>
                {state.deleteFailError && (
                  <div
                    className="p-4 rounded-lg mb-6"
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "2px solid #fca5a5",
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: "#dc2626",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {state.deleteFailError}
                    </p>
                  </div>
                )}

                {/* Delete Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!state.deleteConfirmChecked} // ← DISABLE WHEN NOT CHECKED
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{
                      backgroundColor: state.deleteConfirmChecked
                        ? "#dc2626"
                        : "#ccc", // ← CHANGE COLOR WHEN DISABLED
                      color: "white",
                      fontFamily: "'Poppins', sans-serif",
                      border: "none",
                      cursor: state.deleteConfirmChecked
                        ? "pointer"
                        : "not-allowed", // ← CHANGE CURSOR
                      opacity: state.deleteConfirmChecked ? 1 : 0.6, // ← ADD OPACITY
                    }}
                  >
                    Delete My Account
                  </button>
                  <button
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        showDeleteConfirm: false,
                        deleteConfirmChecked: false,
                      }))
                    }
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: "#f9f9f9",
                      color: "#1a1a1a",
                      fontFamily: "'Poppins', sans-serif",
                      border: "2px solid #ddd",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
