import { Router } from 'express';
import { trackTelemetryEvent } from '../controllers/telemetryController';

const router = Router();

// Public telemetry tracking route (called by live storefront)
router.post('/track', trackTelemetryEvent);

export default router;
