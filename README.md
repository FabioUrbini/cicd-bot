# GitHub CI/CD Failure Notifier

A Node.js application that listens for GitHub webhook events and sends Telegram notifications when CI/CD pipelines fail.

## Features

- Listens for GitHub webhook events
- Detects workflow run failures and check suite failures
- Sends formatted notifications to a Telegram chat
- Validates webhook signatures for security
- Optional repository filtering

## Prerequisites

- Node.js (v16 or higher)
- A Telegram bot (create one via [@BotFather](https://t.me/botfather))
- A GitHub repository with CI/CD workflows

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/github-webhook-ci-notifier.git
   cd github-webhook-ci-notifier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in the `.env` file:
   - `PORT`: The port for the webhook server
   - `WEBHOOK_SECRET`: The secret from your GitHub webhook configuration
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `TELEGRAM_CHAT_ID`: Your Telegram chat ID
   - `GITHUB_REPOSITORY`: (Optional) Specific repository to monitor (format: owner/repo)

## Building the Application

Compile the TypeScript code:
bash
npm run build

## Running the Application

Start the server:
bash
npm run start

## Setting Up GitHub Webhooks

1. Go to your GitHub repository settings
2. Navigate to "Webhooks" and click "Add webhook"
3. Set the Payload URL to your server's URL (e.g., `https://your-server.com/webhook`)
4. Set Content type to `application/json`
5. Enter your webhook secret
6. Under "Which events would you like to trigger this webhook?", select:
   - "Workflow runs"
   - "Check suites"
7. Ensure "Active" is checked
8. Click "Add webhook"

## Testing the Webhook

You can test the webhook by:

1. Running a workflow in your GitHub repository
2. Intentionally causing a workflow to fail
3. Check your Telegram chat for the notification

## License

MIT