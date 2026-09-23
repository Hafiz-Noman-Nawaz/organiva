import { Request, Response } from 'express';
import { Telemetry, TelemetryEventType } from '../models/Telemetry';

export const trackTelemetryEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventType, path, visitorId, metadata } = req.body;

    // Validate essential fields
    if (!eventType || !path || !visitorId) {
      res.status(400).json({ success: false, message: 'eventType, path, and visitorId are required.' });
      return;
    }

    const cleanPath = String(path).trim();

    // Never track admin operations or dashboard views
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api/admin')) {
      res.json({ success: true, ignored: true });
      return;
    }

    if (eventType !== 'impression' && eventType !== 'click') {
      res.status(400).json({ success: false, message: 'Invalid eventType.' });
      return;
    }

    // Persist real telemetry event
    await Telemetry.create({
      eventType: eventType as TelemetryEventType,
      path: cleanPath.substring(0, 500),
      visitorId: String(visitorId).trim().substring(0, 100),
      metadata: metadata && typeof metadata === 'object' ? {
        productId: metadata.productId ? String(metadata.productId).substring(0, 100) : undefined,
        slug: metadata.slug ? String(metadata.slug).substring(0, 100) : undefined,
        referrer: metadata.referrer ? String(metadata.referrer).substring(0, 500) : undefined,
        userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']).substring(0, 300) : undefined,
      } : undefined,
    });

    res.status(201).json({ success: true });
  } catch (error: any) {
    // Non-blocking telemetry failure: log quietly and return 200/500 without impacting client
    console.warn('Telemetry tracking notice:', error?.message);
    res.status(200).json({ success: false });
  }
};
