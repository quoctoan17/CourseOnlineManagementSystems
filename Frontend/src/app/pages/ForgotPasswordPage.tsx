import { useState } from "react";
import { Layout } from "@app/components/Layout";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // STEP 1: check email
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post("/auth/check-email", { email });

      setStep(2);
      setMessage("Email hợp lệ, hãy nhập mật khẩu mới");
    } catch (err: any) {
      setError(err.response?.data?.error || "Email không tồn tại");
    }
  };

  // STEP 2: reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post("/auth/reset-password", {
        email,
        newPassword,
        confirmPassword,
      });

      setMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể đổi mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleCheckEmail}>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-3 rounded mb-4"
              required
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded"
            >
              Xác nhận email
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-4 py-3 rounded mb-4"
              required
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border px-4 py-3 rounded mb-4"
              required
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded"
            >
              Đổi mật khẩu
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-orange-600">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}