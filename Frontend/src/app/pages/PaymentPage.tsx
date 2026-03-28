import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { paymentService } from '@/services/api';
import { CreditCard, Lock, CheckCircle, QrCode } from 'lucide-react';

type Method = 'card' | 'momo';
type Step = 'form' | 'processing' | 'success';

export default function PaymentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  const [step, setStep] = useState<Step>('form');
  const [method, setMethod] = useState<Method>('card');
  const [error, setError] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatPrice = (price: any) =>
    Number(price).toLocaleString('vi-VN') + ' VND';

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const handlePayment = async () => {
    if (method === 'card') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        setError('Vui lòng điền đầy đủ thông tin thẻ');
        return;
      }
    }
    setError('');
    setStep('processing');

    try {
      const res: any = await paymentService.create(courseId!);
      await new Promise(r => setTimeout(r, 2000));
      await paymentService.confirm(res.payment.id);
      setStep('success');
      setTimeout(() => navigate(`/my-courses/${courseId}/lessons`), 2000);
    } catch (err: any) {
      setError(err.message || 'Thanh toán thất bại');
      setStep('form');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-orange-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">

          {/* Success */}
          {step === 'success' && (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-500">Đang chuyển đến khóa học...</p>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700">Đang xử lý thanh toán...</h2>
              <p className="text-gray-400 text-sm mt-2">Vui lòng không đóng trang này</p>
            </div>
          )}

          {/* Form */}
          {step === 'form' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

              {/* Header */}
              <div className="bg-gray-900 text-white px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Thanh toán bảo mật</span>
                </div>
                <h1 className="text-xl font-bold">Xác nhận thanh toán</h1>
              </div>

              <div className="p-6">

                {/* Thông tin khóa học */}
                {course && (
                  <div className="bg-orange-50 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.instructor_name}</div>
                    </div>
                    <div className="text-orange-600 font-bold text-lg flex-shrink-0">
                      {formatPrice(course.price)}
                    </div>
                  </div>
                )}

                {/* Tab chọn phương thức */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => { setMethod('card'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition
                      ${method === 'card'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Thẻ ngân hàng
                  </button>
                  <button
                    onClick={() => { setMethod('momo'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition
                      ${method === 'momo'
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <QrCode className="h-4 w-4" />
                    Momo QR
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* === CARD FORM === */}
                {method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số thẻ</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                        className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={e => setExpiry(e.target.value.slice(0, 5))}
                          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* === MOMO QR === */}
                {method === 'momo' && (
                  <div className="text-center">
                    <div className="bg-pink-50 rounded-xl p-6 mb-4">
                      {/* QR mock — SVG đơn giản */}
                      <div className="w-48 h-48 mx-auto bg-white rounded-xl shadow p-3 mb-3">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Border squares */}
                          <rect x="5" y="5" width="30" height="30" fill="none" stroke="#ae2070" strokeWidth="4"/>
                          <rect x="12" y="12" width="16" height="16" fill="#ae2070"/>
                          <rect x="65" y="5" width="30" height="30" fill="none" stroke="#ae2070" strokeWidth="4"/>
                          <rect x="72" y="12" width="16" height="16" fill="#ae2070"/>
                          <rect x="5" y="65" width="30" height="30" fill="none" stroke="#ae2070" strokeWidth="4"/>
                          <rect x="12" y="72" width="16" height="16" fill="#ae2070"/>
                          {/* Random dots mock */}
                          {[40,45,50,55,60,40,50,60,42,52,62,44,54,48,58].map((x, i) => (
                            <rect key={i} x={x} y={[40,43,46,49,52,55,58,61,64,44,47,50,53,56,59][i]} width="4" height="4" fill="#ae2070"/>
                          ))}
                          <rect x="40" y="70" width="25" height="4" fill="#ae2070"/>
                          <rect x="70" y="65" width="4" height="20" fill="#ae2070"/>
                          <rect x="78" y="70" width="4" height="15" fill="#ae2070"/>
                          <rect x="86" y="65" width="4" height="10" fill="#ae2070"/>
                        </svg>
                      </div>
                      <div className="text-pink-700 font-semibold text-sm mb-1">Quét mã QR bằng app Momo</div>
                      <div className="text-pink-500 text-xs">Mã QR hết hạn sau 10 phút</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Số tài khoản</span>
                        <span className="font-semibold text-gray-800">0909 123 456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tên</span>
                        <span className="font-semibold text-gray-800">CONG TY KHOA HOC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Số tiền</span>
                        <span className="font-semibold text-pink-600">{course ? formatPrice(course.price) : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nội dung</span>
                        <span className="font-semibold text-gray-800">THANHTOAN {courseId}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      Sau khi chuyển khoản, bấm "Xác nhận đã thanh toán"
                    </p>
                  </div>
                )}

                {/* Nút thanh toán */}
                <button
                  onClick={handlePayment}
                  className={`w-full mt-6 text-white font-semibold py-3 rounded-xl transition
                    ${method === 'momo'
                      ? 'bg-pink-500 hover:bg-pink-600'
                      : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {method === 'momo'
                    ? 'Xác nhận đã thanh toán'
                    : `Thanh toán ${course ? formatPrice(course.price) : ''}`}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  🔒 Thông tin được mã hóa và bảo mật
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}