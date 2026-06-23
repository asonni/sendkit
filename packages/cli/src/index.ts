import { Command } from 'commander';
import { sendTelegramMessage } from 'sendkit-core';

const program = new Command();

program
  .name('sendkit')
  .description('SendKit tutorial CLI')
  .command('telegram')
  .description('Send a Telegram message')
  .argument('<chatId>', 'Telegram chat ID')
  .argument('<message>', 'The message text to send')
  .action(async (chatId: string, message: string) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error(
        'Error: TELEGRAM_BOT_TOKEN environment variable is not set.'
      );
      process.exit(1);
    }

    if (!chatId) {
      console.error('Error: chatId is required.');
      process.exit(1);
    }

    if (!message) {
      console.error('Error: message is required.');
      process.exit(1);
    }

    try {
      const result = await sendTelegramMessage({ botToken, chatId, message });

      console.log(`Sent Telegram message to chat ${result.chatId}.`);
      console.log(`Telegram message ID: ${result.messageId}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`Telegram API request failed: ${detail}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
