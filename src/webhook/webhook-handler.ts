import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { TelegramService } from '../services/telegram-service';
import { GitHubWebhookEvent, GitHubWorkflowRunEvent, GitHubCheckSuiteEvent } from '../types/github-webhook';

export class WebhookHandler {
  private readonly webhookSecret: string;
  private readonly telegramService: TelegramService;
  private readonly targetRepository?: string;

  constructor(
    webhookSecret: string,
    telegramService: TelegramService,
    targetRepository?: string
  ) {
    this.webhookSecret = webhookSecret;
    this.telegramService = telegramService;
    this.targetRepository = targetRepository;
  }

  /**
   * Validates the GitHub webhook signature
   */
  verifySignature(req: Request): boolean {
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured, skipping signature verification');
      return true;
    }

    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) {
      console.error('X-Hub-Signature-256 header missing');
      return false;
    }

    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    );
  }

  /**
   * Middleware to handle GitHub webhook requests
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verify webhook signature
      if (!this.verifySignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const event = req.headers['x-github-event'] as string;
      console.log(`Received GitHub webhook event: ${event}`);

      // Check if we should process this repository
      if (this.targetRepository && req.body.repository.full_name !== this.targetRepository) {
        console.log(`Skipping event for non-target repository: ${req.body.repository.full_name}`);
        return res.status(200).json({ message: 'Event ignored - not target repository' });
      }

      // Process the event
      switch (event) {
        case 'workflow_run':
          await this.handleWorkflowRun(req.body as GitHubWorkflowRunEvent);
          break;
        case 'check_suite':
          await this.handleCheckSuite(req.body as GitHubCheckSuiteEvent);
          break;
        default:
          console.log(`Ignoring unsupported event type: ${event}`);
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      next(error);
    }
  };

  /**
   * Handles workflow_run events
   */
  private async handleWorkflowRun(event: GitHubWorkflowRunEvent): Promise<void> {
    // Only process completed workflow runs with a failure
    if (
      event.action === 'completed' &&
      event.workflow_run.conclusion === 'failure'
    ) {
      console.log(`Processing failed workflow run: ${event.workflow_run.name}`);
      await this.telegramService.notifyWorkflowRunFailure(
        event.workflow_run,
        event.repository
      );
    }
  }

  /**
   * Handles check_suite events
   */
  private async handleCheckSuite(event: GitHubCheckSuiteEvent): Promise<void> {
    // Only process completed check suites with a failure
    if (
      event.action === 'completed' &&
      event.check_suite.conclusion === 'failure'
    ) {
      console.log(`Processing failed check suite for ${event.repository.full_name}`);
      await this.telegramService.notifyCheckSuiteFailure(event);
    }
  }
} 