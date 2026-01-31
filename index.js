require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config/config');
const ReminderService = require('./src/services/reminderService');
const CommandHandler = require('./src/handlers/commandHandler');
const { initRedis } = require('./src/config/redis');

(async () => {
  // 🔥 Initialize Redis safely (never crashes bot)
  await initRedis();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const commandHandler = new CommandHandler(client);

  client.once('ready', async () => {
    console.log(`logged in as ${client.user.tag}`);

    const reminderService = new ReminderService(client);
    await reminderService.setupPrayerReminders();

    console.log('bot is ready and prayer reminders are active!');
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await commandHandler.handleMessage(message);
  });

  await client.login(config.DISCORD_TOKEN);
})();
