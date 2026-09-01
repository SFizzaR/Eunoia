"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "@/app/context/AuthContext";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

    login(formData.email, formData.password)
      .then(() => {
        router.push("/Dashboard");
      })
      .catch((error) => {
        setErrors({ general: error.message || "Login failed" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      {/* Decorative background */}

      <div className={styles.decoration}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      {/* Info Section (Left side on desktop) */}
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
          <h2 className={styles.infoTitle}>Welcome Back</h2>
          <p className={styles.infoText}>
            Continue your journey towards beautiful thinking. Your journal
            entries and mood insights await.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📝</span>
              <p>Your private journal space</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <p>Track your mood patterns</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🎯</span>
              <p>Personalized mood insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className={styles.formWrapper}>
        {/* Header */}

        <div className={styles.header}>
          <h1 className={styles.title}>Eunoia</h1>
          <p className={styles.subtitle}>Welcome back</p>
          <p className={styles.tagline}>Sign in to continue journaling</p>
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
              autoComplete="email"
            />
            {errors.email && (
              <p className={styles.fieldError}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot?
              </Link>
            </div>
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
                autoComplete="current-password"
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
            {errors.password && (
              <p className={styles.fieldError}>{errors.password}</p>
            )}
          </div>

          {/* Remember me */}
          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className={styles.rememberLabel}>
              Remember me
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Signup link */}
        <div className={styles.signupLink}>
          <p>
            Don't have an account?{" "}
            <Link href="/Auth/Register" className={styles.link}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
