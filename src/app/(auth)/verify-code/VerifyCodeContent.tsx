"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/store/api/authApi";
import { useToast } from "@/components/ToastProvider";
import { getErrorMessage } from "@/lib/utils/error-handler";

const CODE_LENGTH = 6;

export default function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const toast = useToast();

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otp = digits.join("");

    if (otp.length < CODE_LENGTH) {
      setError("Please enter the full code");
      return;
    }

    setError("");

    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      const resetToken = res.data.resetToken;
      toast.success(res.message || "OTP verified!");
      router.push(
        `/reset-password?resetToken=${encodeURIComponent(resetToken)}`,
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendOtp({ email }).unwrap();
      toast.success(res.message || "A new OTP has been sent. Please check your spam or junk mail.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthCard>
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900">Verification code</h1>

        <p className="mt-1 text-sm text-slate-500">
          We sent a reset link to {email || "your email"}
          <br />
          enter 6 digit code that is mentioned in the email
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Please check your spam or junk mail. If the first code does not work, request another one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* <div className="flex justify-center gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="size-12 rounded-lg border border-slate-200 text-center text-base font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          ))}
        </div> */}
        <div className="flex w-full justify-center gap-1.5 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 text-center text-base font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:h-12 sm:max-w-12"
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm font-medium text-rose-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </button>

        <p className="text-center text-sm text-slate-500">
          You have not received the email?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-emerald-500 transition-colors hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? "Resending..." : "Resend"}
          </button>
        </p>
      </form>
    </AuthCard>
  );
}
