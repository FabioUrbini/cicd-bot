import axios from 'axios';
import { GitHubRepository, GitHubWorkflowRun, GitHubCheckSuiteEvent } from '../types/github-webhook';

export class TelegramService {
  private readonly token: string;
  private readonly chatId: string;
  private readonly baseUrl: string;

  constructor(token: string, chatId: string) {
    if (!token || !chatId) {
      throw new Error('Telegram bot token and chat ID are required');
    }
    
    this.token = token;
    this.chatId = chatId;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  /**
   * Sends a message to the configured Telegram chat
   */
  async sendMessage(message: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
      });
      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      throw new Error('Failed to send Telegram notification');
    }
  }

  /**
   * Formats and sends a notification about a workflow run failure
   */
  async notifyWorkflowRunFailure(
    workflowRun: GitHubWorkflowRun,
    repository: GitHubRepository
  ): Promise<void> {
    const message = this.formatWorkflowRunMessage(workflowRun, repository);
    await this.sendMessage(message);
  }

  /**
   * Formats and sends a notification about a check suite failure
   */
  async notifyCheckSuiteFailure(event: GitHubCheckSuiteEvent): Promise<void> {
    const message = this.formatCheckSuiteMessage(event);
    await this.sendMessage(message);
  }

  /**
   * Formats a workflow run failure message
   */
  private formatWorkflowRunMessage(
    workflowRun: GitHubWorkflowRun,
    repository: GitHubRepository
  ): string {
    return `
❌ <b>CI/CD Pipeline Failure</b>

<b>Repository:</b> <a href="${repository.html_url}">${repository.full_name}</a>
<b>Workflow:</b> ${workflowRun.name}
<b>Branch:</b> ${workflowRun.head_branch}
<b>Commit:</b> ${workflowRun.head_sha.substring(0, 7)}
<b>Status:</b> ${workflowRun.conclusion || workflowRun.status}

<a href="${workflowRun.html_url}">View Workflow Run</a>
`;
  }

  /**
   * Formats a check suite failure message
   */
  private formatCheckSuiteMessage(event: GitHubCheckSuiteEvent): string {
    const { check_suite, repository } = event;
    
    return `
❌ <b>CI/CD Check Suite Failure</b>

<b>Repository:</b> <a href="${repository.html_url}">${repository.full_name}</a>
<b>Branch:</b> ${check_suite.head_branch}
<b>Commit:</b> ${check_suite.head_sha.substring(0, 7)}
<b>Status:</b> ${check_suite.conclusion || check_suite.status}

<a href="${repository.html_url}/commit/${check_suite.head_sha}/checks">View Checks</a>
`;
  }
} 