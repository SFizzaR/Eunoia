"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "@/app/context/AuthContext";
import { FormData, FormErrors } from "../../../types/registerForm";

export default function Register() {
  const { signup } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    // Update password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
      )
        .then(() => {
          router.push("/Dashboard");
        })
        .catch((error) => {
          setErrors({ general: error.message || "Signup failed" });
        });
    } catch (error) {
      setErrors({ general: "Error connecting to server. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Get password strength label and color
  const getPasswordStrengthLabel = (strength: number) => {
    const labels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#ff6b6b", "#ff9999", "#ffd700", "#90EE90", "#2ecc71"];
    return { label: labels[strength], color: colors[strength] };
  };

  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className={styles.container}>
      {/* Decorative background */}
      <div className={styles.decoration}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      {/* Register form */}
      <div className={styles.formWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Eunoia</h1>
          <p className={styles.subtitle}>Create your account</p>
          <p className={styles.tagline}>
            Begin your journey to beautiful thinking
          </p>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className={styles.errorAlert}>
            <span>⚠️</span>
            <p>{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Name row */}
          <div className={styles.nameRow}>
            {/* First name */}
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                placeholder="John"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className={styles.fieldError}>{errors.firstName}</p>
              )}
            </div>

            {/* Last name */}
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name (optional)
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Doe"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className={styles.fieldError}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {formData.password && (
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              )}
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className={styles.strengthContainer}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: strengthInfo.color,
                    }}
                  ></div>
                </div>
                <p
                  className={styles.strengthText}
                  style={{ color: strengthInfo.color }}
                >
                  Strength: {strengthInfo.label}
                </p>
              </div>
            )}

            {errors.password && (
              <p className={styles.fieldError}>{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {formData.confirmPassword && (
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              )}
            </div>
            {errors.confirmPassword && (
              <p className={styles.fieldError}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms & privacy */}
          <p className={styles.termsText}>
            By registering, you agree to our{" "}
            <Link href="/PrivacyPolicy" className={styles.link}>
              Privacy Policy
            </Link>
          </p>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login link */}
        <div className={styles.loginLink}>
          <p>
            Already have an account?{" "}
            <Link href="/Auth/Login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Quote/Info */}
      <div className={styles.infoSection}>
        <Image
          src="/reg.jpg"
          alt="cherry blossom background"
          fill
          priority
          className={styles.heroImage}
        />
        <div
          className={styles.infoContent}
          style={{ position: "relative", zIndex: 10 }}
        >
          <h2 className={styles.infoTitle}>Welcome to Eunoia</h2>
          <p className={styles.infoText}>
            "Eunoia" means beautiful thinking in Greek. It's the essence of
            clarity, understanding, and peace of mind.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📝</span>
              <p>Write freely without judgment</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>😊</span>
              <p>Understand your mood patterns</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✨</span>
              <p>Get personalized suggestions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
