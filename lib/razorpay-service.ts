/**
 * Razorpay Payment Gateway Service & Transaction Ledger
 * Supports test mode checkout, UPI simulation, card processing,
 * spot booking advance, marketplace purchases, and rent split payments.
 */

export interface PaymentTransaction {
  id: string; // e.g. pay_test_983192381
  order_id: string; // e.g. order_test_2391023
  type: "housing_booking" | "marketplace_purchase" | "rent_split";
  type_label: string;
  amount: number; // in INR ₹
  currency: "INR";
  status: "success" | "pending" | "failed" | "refunded";
  item_id: string;
  item_title: string;
  payer_id: string;
  payer_name: string;
  payer_email: string;
  payer_initials?: string;
  payee_id?: string;
  payee_name?: string;
  payee_email?: string;
  payment_method: "upi" | "card" | "netbanking" | "wallet";
  payment_details?: {
    card_last4?: string;
    card_network?: string;
    upi_id?: string;
    bank_name?: string;
  };
  pickup_otp?: string;
  booking_spot?: number;
  notes?: Record<string, string>;
  created_at: string;
}

const STORAGE_KEY = "campusloop_payment_transactions";

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [];

/**
 * Loads transactions from localStorage.
 */
export function getTransactions(): PaymentTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Returns transactions where the given user is either payer or payee.
 */
export function getTransactionsByUserId(userId: string): PaymentTransaction[] {
  const all = getTransactions();
  return all.filter((tx) => tx.payer_id === userId || tx.payee_id === userId);
}

/**
 * Returns a specific transaction by ID.
 */
export function getTransactionById(id: string): PaymentTransaction | undefined {
  const all = getTransactions();
  return all.find((tx) => tx.id === id);
}

/**
 * Records a new completed or pending transaction and notifies the app.
 */
export function recordPaymentTransaction(
  data: Omit<PaymentTransaction, "id" | "order_id" | "created_at"> & {
    id?: string;
    order_id?: string;
    created_at?: string;
  }
): PaymentTransaction {
  const all = getTransactions();
  const timestamp = data.created_at || new Date().toISOString();
  const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);

  const newTx: PaymentTransaction = {
    ...data,
    id: data.id || `pay_test_${randomSuffix}`,
    order_id: data.order_id || `order_test_${Math.floor(10000000 + Math.random() * 90000000)}`,
    created_at: timestamp,
  };

  const updated = [newTx, ...all];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("campusloop_transactions_updated"));
    } catch (e) {
      console.error("Failed to save transaction to localStorage:", e);
    }
  }

  return newTx;
}

/**
 * Refunds or marks a transaction as refunded
 */
export function refundTransactionForBooking(
  itemId: string,
  userId: string,
  reason: string
): PaymentTransaction | null {
  const all = getTransactions();
  const txIndex = all.findIndex(
    (tx) => tx.item_id === itemId && tx.payer_id === userId && tx.status === "success"
  );
  if (txIndex >= 0) {
    all[txIndex] = {
      ...all[txIndex],
      status: "refunded",
      notes: {
        ...(all[txIndex].notes || {}),
        cancellation_reason: reason,
        refunded_at: new Date().toISOString(),
        refund_status: "100% Deposit Refund Initiated (Razorpay Test Mode)",
      },
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        window.dispatchEvent(new Event("campusloop_transactions_updated"));
      } catch (e) {}
    }
    return all[txIndex];
  }
  return null;
}

/**
 * Dynamically loads Razorpay checkout script if available
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Helper to generate 4-digit pickup verification OTP
 */
export function generatePickupOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Get Razorpay Test Public Key
 */
export function getRazorpayKeyId(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_test_campusloop_demo"
  );
}
