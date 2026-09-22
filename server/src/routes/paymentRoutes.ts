import { Router } from 'express';
import {
  handleJazzCashCallback,
  handleEasypaisaCallback,
  handleSafepayCallback,
  verifySafepayPayment,
  mockConfirmPayment,
} from '../controllers/paymentController';

const router = Router();

// Gateway callbacks
router.all('/safepay/callback', handleSafepayCallback);
router.post('/safepay/verify', verifySafepayPayment);
router.all('/jazzcash/callback', handleJazzCashCallback);
router.all('/easypaisa/callback', handleEasypaisaCallback);

// Local Dev / Sandbox simulation confirmation
router.post('/sandbox/confirm', mockConfirmPayment);

export default router;
