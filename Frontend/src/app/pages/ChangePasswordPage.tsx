import { useState } from "react";
import { authService } from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleCheckEmail = async () => {
    setError("");

    try {
      await authService.checkEmail(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Email không tồn tại");
    }
  };

  const handleResetPassword = async () => {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    try {
      await authService.resetPassword(email, newPassword, confirmPassword);
      setMessage("Đổi mật khẩu thành công");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Không thể đổi mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Quên mật khẩu
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-600 p-3 mb-4 rounded">
            {message}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <button
              onClick={handleCheckEmail}
              className="w-full bg-orange-600 text-white py-3 rounded"
            >
              Xác nhận email
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-orange-600 text-white py-3 rounded"
            >
              Đổi mật khẩu
            </button>
          </>
        )}

      </div>
    </div>
  );
}