"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  api?: string;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((values: LoginForm): FormErrors => {
    const errs: FormErrors = {};
    if (!values.email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = "Enter a valid email";
    }
    if (!values.password) {
      errs.password = "Password is required";
    } else if (values.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const errs = validate(form);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      try {
        setLoading(true);
        setErrors({});

        const response = await fetch("https://protective-freedom-production-1d23.up.railway.app/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        const data: LoginResponse = await response.json();

        if (!response.ok) {
          setErrors({ api: data.message ?? "Login failed. Please try again." });
          return;
        }

        const token = data.token ?? data.accessToken;
        if (token) {
          localStorage.setItem("authToken", token);
        }

        router.push("/home");
      } catch {
        setErrors({ api: "Network error. Please check your connection." });
      } finally {
        setLoading(false);
      }
    },
    [form, validate]
  );

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className={styles.error} role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p id="password-error" className={styles.error} role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {errors.api && (
            <p className={styles.error} role="alert">
              {errors.api}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
            aria-label="Sign in"
          >
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : null}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
