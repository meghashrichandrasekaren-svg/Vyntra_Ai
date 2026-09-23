import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { VyntraFlightOffer, Passenger } from '../types/travel.ts';

interface PaymentModalProps {
  offer: VyntraFlightOffer;
  passengers: Passenger[];
  onClose: () => void;
  onPaymentSuccess: (paymentData: { method: string; amount: number; transactionId: string }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  offer,
  passengers,
  onClose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('883');
  const [cardName, setCardName] = useState(passengers[0]?.firstName + ' ' + passengers[0]?.lastName);
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handlePay = () => {
    setIsProcessing(true);
    setProcessingStep('Connecting to Secure Sandbox Payment Gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing 3D-Secure Test Verification...');
    }, 1200);

    setTimeout(() => {
      setProcessingStep('Generating PNR with Airline Reservation System...');
    }, 2400);

    setTimeout(() => {
      const txnId = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setIsProcessing(false);
      onPaymentSuccess({
        method: method === 'CARD' ? 'Credit/Debit Card (Test)' : method === 'UPI' ? 'UPI' : `NetBanking (${selectedBank})`,
        amount: offer.price.total,
        transactionId: txnId,
      });
    }, 3600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Vyntra Secure Checkout</h3>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">Total payable: {offer.price.currency} {offer.price.total.toLocaleString()}</p>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isProcessing ? (
          /* Processing State */
          <div className="my-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute h-full w-full animate-ping rounded-full bg-sky-500/20" />
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{processingStep}</div>
              <p className="text-xs text-slate-400 mt-1">Please do not refresh or close this window.</p>
            </div>
          </div>
        ) : (
          /* Main Payment Form */
          <div className="mt-5 space-y-5">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-all ${
                  method === 'CARD'
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-all ${
                  method === 'UPI'
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <QrCode className="h-5 w-5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('NETBANKING')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-all ${
                  method === 'NETBANKING'
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building className="h-5 w-5" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Method Inputs */}
            {method === 'CARD' && (
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Card Number (Sandbox Test)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-white outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 font-mono text-xs text-white outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {method === 'UPI' && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border border-slate-800 bg-white p-3 shadow-inner">
                  <div className="text-center font-mono text-xs text-slate-950 font-bold leading-tight">
                    [VYNTRA-PAY-QR]
                    <br />
                    Scan with any UPI App
                    <br />
                    <span className="text-[10px] text-slate-600 font-normal">₹{offer.price.total}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Or enter UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@upi"
                    className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-center text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {method === 'NETBANKING' && (
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="text-[11px] font-medium text-slate-400">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`rounded-xl border p-2.5 text-xs font-medium text-left transition-all ${
                        selectedBank === bank
                          ? 'border-sky-500 bg-sky-500/10 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sandbox Notice */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-sky-500/20 bg-sky-950/20 p-3 text-xs text-sky-300">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>
                <strong>Sandbox Payment:</strong> Test payment simulation with 256-bit SSL encryption. No actual funds are charged.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handlePay}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-95 active:scale-[0.99]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>
                Authorize & Pay {offer.price.currency} {offer.price.total.toLocaleString()}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
