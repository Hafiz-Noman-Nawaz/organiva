import { Router } from 'express';
import { askAiConcierge, streamAiConcierge, getKnowledgeBaseOverview } from '../controllers/aiController';

const router = Router();

router.post('/chat', askAiConcierge);
router.post('/chat-stream', streamAiConcierge);
router.get('/knowledge', getKnowledgeBaseOverview);

export default router;
