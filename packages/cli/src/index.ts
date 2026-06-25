import { Command } from 'commander';
import { z } from 'zod';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { sendTelegramMessage } from 'sendkit-core';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const program = new Command();
const configPath = join(homedir(), '.config', 'sendkit', 'config.json');
const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional()
});

function writeTelegramBotToken(token: string) {
  const configDir = dirname(configPath);

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(
    configPath,
    `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`,
    { mode: 0o600 }
  );
}

function getTelegramBotToken() {
  if (!existsSync(configPath)) {
    throw new Error('Telegram bot token is required, run `sendkit init.`.');
  }

  const config = cliConfigSchema.parse(
    JSON.parse(readFileSync(configPath, 'utf-8'))
  );
  const token = config.telegramBotToken;

  if (!token) {
    throw new Error('Telegram bot token is required, run `sendkit init.`.');
  }

  return token;
}

program.name('sendkit').description('SendKit CLI backend by sendkit-core');

program
  .command('init')
  .description('Configure SendKit CLI local settings')
  .requiredOption('--telegram-bot-token <botToken>', 'Telegram bot token')
  .action(async (options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(`Saved SendKit CLI config to ${configPath}`);
  });

program
  .command('telegram')
  .description('Send a Telegram message')
  .argument('<chatId>', 'Telegram chat ID')
  .argument('<message>', 'The message text to send')
  .action(async (chatId: string, message: string) => {
    const botToken = getTelegramBotToken();
    const result = await sendTelegramMessage({ botToken, chatId, message });

    console.log(JSON.stringify(result));
  });

await program.parseAsync(process.argv).catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${detail}`);
  process.exitCode = 1;
});
