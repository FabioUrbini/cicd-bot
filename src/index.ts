import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { WebhookHandler } from './webhook/webhook-handler';
import { TelegramService } from './services/telegram-service';

// Load environment variables
dotenv.config();

// Environment variables
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;

// Check required environment variables
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required environment variables');
  process.exit(1);
}

// Initialize services
const telegramService = new TelegramService(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
const webhookHandler = new WebhookHandler(WEBHOOK_SECRET, telegramService, GITHUB_REPOSITORY);

// Create Express app
const app = express();

// Configure middleware
app.use(bodyParser.json());

// Define routes
app.post('/webhook', webhookHandler.handleWebhook);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
  console.log(`Target repository: ${GITHUB_REPOSITORY || 'All repositories'}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
}); 