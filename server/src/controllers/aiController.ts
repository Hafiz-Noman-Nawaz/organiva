import { Request, Response } from 'express';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { KnowledgeDocument } from '../models/KnowledgeDocument';

export const askAiConcierge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, message, history } = req.body;
    const promptText = (query || message || '').trim();

    if (!promptText) {
      res.status(400).json({ success: false, message: 'Inquiry query or message string is required' });
      return;
    }

    const answer = await KnowledgeBaseService.answerCustomerQuery(promptText, history || []);

    res.json({
      success: true,
      query: promptText,
      answer: answer.response,
      recommendedProducts: answer.recommendedProducts || [],
    });
  } catch (error: any) {
    console.error('AI Concierge fallback triggered:', error?.message || error);
    // Never return 500: Return friendly Orgi response
    res.status(200).json({
      success: true,
      query: req.body?.query || req.body?.message || '',
      answer: 'Assalam-o-alaikum! Welcome to Organiva. I am Orgi, your home organization AI companion. We offer smart problem-solving products for your kitchen, living room, wardrobe, and car, with nationwide delivery and Cash on Delivery. How can I help you organize today?',
      recommendedProducts: [],
    });
  }
};

// Stream AI response using Server-Sent Events (SSE)
export const streamAiConcierge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, message } = req.body;
    const promptText = (query || message || '').trim();

    if (!promptText) {
      res.status(400).json({ success: false, message: 'Inquiry query or message string is required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await KnowledgeBaseService.streamCustomerQuery(promptText, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    res.write(
      `data: ${JSON.stringify({ done: true, recommendedProducts: result.recommendedProducts })}\n\n`
    );
    res.end();
  } catch (error: any) {
    console.error('AI Stream fallback triggered:', error?.message || error);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }
    const fallbackMessage = 'Assalam-o-alaikum! Welcome to Organiva. We design smart, minimal home organization products that simplify everyday living. How can I assist your home organization today?';
    res.write(`data: ${JSON.stringify({ text: fallbackMessage })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, recommendedProducts: [] })}\n\n`);
    res.end();
  }
};

export const getKnowledgeBaseOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await KnowledgeDocument.find().sort({ updatedAt: -1 }).lean();
    res.json({ success: true, count: documents.length, documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
