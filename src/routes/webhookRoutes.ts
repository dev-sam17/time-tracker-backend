import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import {
  handleWebhookPost,
  handleWebhookPut,
  handleWebhookPatch,
  handleWebhookGet,
  handleWebhookDelete
} from '../controllers/webhookController';

const router: ExpressRouter = Router();

// Handle all HTTP methods for webhook endpoint
router.post('/', handleWebhookPost);
router.put('/', handleWebhookPut);
router.patch('/', handleWebhookPatch);
router.get('/', handleWebhookGet);
router.delete('/', handleWebhookDelete);

// Optional: specific webhook endpoints for different services
router.post('/github', handleWebhookPost);
router.post('/stripe', handleWebhookPost);
router.post('/auth', handleWebhookPost);
router.post('/general', handleWebhookPost);

export default router;
