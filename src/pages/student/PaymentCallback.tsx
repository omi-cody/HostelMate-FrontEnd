import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';

// Khalti redirects here with:
//   ?pidx=xxx&status=Completed&purchase_order_id=<paymentId>&amount=xxx&transaction_id=xxx
// purchase_order_id is our internal Payment UUID (set as purchase_order_id when initiating)
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const pidx = params.get('pidx');
    // Khalti sends our paymentId back as purchase_order_id
    const paymentId = params.get('purchase_order_id') || params.get('paymentId') || params.get('payment_id');
    const khaltiStatus = params.get('status');

    if (!pidx || !paymentId) {
      setStatus('failed');
      setMessage('Missing payment parameters. Please check your payment history.');
      return;
    }

    if (khaltiStatus && khaltiStatus.toLowerCase() !== 'completed') {
      setStatus('failed');
      setMessage(`Payment was not completed (status: ${khaltiStatus}). No charge was made.`);
      return;
    }

    studentService.verifyKhaltiPayment(paymentId, pidx)
      .then(() => {
        setStatus('success');
        setMessage('Payment verified successfully! Your monthly fee has been recorded.');
      })
      .catch((err: any) => {
        setStatus('failed');
        setMessage(err?.response?.data?.message || 'Payment verification failed. Please contact support with your transaction reference.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center border border-gray-200">

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-medium mb-2">Verifying Payment</h2>
            <p className="text-gray-400 text-sm">Please wait while we confirm your payment with Khalti...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-green-700 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link to="/student/my-hostel"
              className="block w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium transition-colors">
              View My Hostel
            </Link>
            <Link to="/student/applications" className="block mt-3 text-sm text-gray-400 hover:text-cyan-500">
              View Applications
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link to="/student/payments"
              className="block w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium transition-colors">
              Go to Payments
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
